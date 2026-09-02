/**
 * worker/whatsapp.js — إرسال كود OTP عبر واتساب + التحقق من الـ Webhook.
 *
 * مزوّدان مدعومان:
 *   1) "meta"   → WhatsApp Cloud API الرسمي (Meta Graph API).
 *   2) "dev"    → وضع التطوير: لا يُرسل شيء فعلياً، ويُعاد الكود في
 *                 الاستجابة/السجلات حتى تُختبر الدورة كاملة محلياً.
 *   (يمكن إضافة Twilio/360dialog بنفس الواجهة — انظر sendOtpMessage)
 *
 * متغيرات البيئة (wrangler secrets):
 *   WHATSAPP_PROVIDER        meta | dev            (الافتراضي: dev إن لم يوجد توكن)
 *   WHATSAPP_TOKEN           رمز وصول دائم من Meta App
 *   WHATSAPP_PHONE_NUMBER_ID معرّف رقم العمل في Cloud API
 *   WHATSAPP_OTP_TEMPLATE    اسم قالب "authentication" المعتمد (افتراضي: omran_admin_login)
 *   WHATSAPP_TEMPLATE_LANG  لغة القالب (افتراضي: ar)
 *   WHATSAPP_VERIFY_TOKEN   رمز التحقق لاشتراك الـ Webhook (يُضبط في Meta Dashboard)
 *   WHATSAPP_APP_SECRET     سر التطبيق للتحقق من توقيع X-Hub-Signature-256
 *   AUTH_DEV_MODE           1 = إرجاع dev_code في الاستجابة (تطوير فقط!)
 */

import { timingSafeEqual } from './auth.js';

const GRAPH_VERSION = 'v21.0';

/** هل وضع التطوير مفعّل؟ */
export function isDevMode(env) {
  return env.AUTH_DEV_MODE === '1' || (env.WHATSAPP_PROVIDER || '') === 'dev' || !env.WHATSAPP_TOKEN;
}

/**
 * إرسال كود OTP (ورابط سحري إن توفر قالب URL) إلى رقم المدير.
 * يعيد { delivered: boolean, devCode?: string, providerError?: string }
 */
export async function sendOtpMessage(env, phone, code, magicUrl = null) {
  if (isDevMode(env)) {
    // تطوير: لا رسالة حقيقية — الكود يظهر في سجل الـ Worker و(اختيارياً) في الاستجابة
    console.warn(`[AUTH:DEV] كود دخول ${phone} → ${code}${magicUrl ? ` | رابط: ${magicUrl}` : ''}`);
    return { delivered: true, devCode: code, devMagicUrl: magicUrl };
  }

  // ---- WhatsApp Cloud API: قالب authentication مع زر نسخ الكود ----
  const templateName = env.WHATSAPP_OTP_TEMPLATE || 'omran_admin_login';
  const lang = env.WHATSAPP_TEMPLATE_LANG || 'ar';
  const body = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: templateName,
      language: { code: lang },
      components: [
        // باراميتر نص الكود يظهر في جسم القالب إن كان يحوي {{1}}
        { kind: 'body', type: 'body', parameters: [{ type: 'text', text: code }] },
        // زر copy_code/autofill (OTP button) — أول باراميتر للأزرار
        {
          type: 'button',
          sub_type: 'url', // إذا كان بالقالب زر رابط "تسجيل الدخول" {{2}}
          index: '0',
          parameters: magicUrl ? [{ type: 'text', text: magicUrl }] : undefined,
        },
      ],
    },
  };
  // قوالب authentication لا تدعم أزرار URL — أزل المكوّن إن لم يكن هناك قالب روابط
  if (!magicUrl) body.template.components = [body.template.components[0]];

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('WhatsApp send failed:', JSON.stringify(data));
      return { delivered: false, providerError: data?.error?.message || `HTTP ${res.status}` };
    }
    return { delivered: true, messageId: data?.messages?.[0]?.id };
  } catch (err) {
    console.error('WhatsApp send error:', err);
    return { delivered: false, providerError: String(err) };
  }
}

// ======================= الـ Webhook (Meta → Worker) =======================

/**
 * GET /api/webhooks/whatsapp — خطوة "التحقق" عند اشتراك الـ Webhook
 * في Meta Dashboard: نعيد hub.challenge فقط إذا طابق الرمز ما لدينا.
 */
export function verifyWebhookSubscription(url, env) {
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token && env.WHATSAPP_VERIFY_TOKEN &&
      timingSafeEqual(token, env.WHATSAPP_VERIFY_TOKEN) && challenge) {
    return new Response(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }
  return new Response('Forbidden', { status: 403 });
}

/**
 * POST /api/webhooks/whatsapp — التحقق من التوقيع ثم معالجة الأحداث.
 * التوقيع: X-Hub-Signature-256 = "sha256=" + HMAC-SHA256(rawBody, APP_SECRET)
 * المقارنة زمنية ثابتة لمنع تزوير الإشعارات.
 */
export async function handleWebhookPost(request, env, rawBody) {
  if (env.WHATSAPP_APP_SECRET) {
    const signature = request.headers.get('x-hub-signature-256') || '';
    const expected = 'sha256=' + (await hmacSha256Hex(env.WHATSAPP_APP_SECRET, rawBody));
    if (!timingSafeEqual(signature, expected)) {
      return new Response(JSON.stringify({ success: false, error: 'توقيع Webhook غير صالح' }), {
        status: 403, headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }
  }

  let payload;
  try { payload = JSON.parse(rawBody); } catch { return new Response(null, { status: 400 }); }

  // يجب الرد 200 بسرعة دائماً وإلا يعيد Meta الإرسال — المعالجة خفيفة هنا
  try { await processWebhookEvents(env, payload); } catch (err) { console.error('webhook processing error:', err); }
  return new Response(JSON.stringify({ success: true }), {
    status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/** معالجة أحداث الإشعارات: حالات تسليم رسائل OTP + الردود الواردة */
async function processWebhookEvents(env, payload) {
  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      // 1) حالات التسليم لرسائلنا — نحدّث delivery_status في تحدي الدخول
      //    عبر message_id الذي خزّناه لحظة إرسال كود OTP
      for (const status of value.statuses || []) {
        if (!status.id) continue;
        await env.DB.prepare(
          `UPDATE auth_challenges
              SET delivery_status = ?
            WHERE message_id = ? AND revoked_at IS NULL AND consumed_at IS NULL`
        )
          .bind(status.status === 'failed' ? 'failed' : status.status || 'unknown', status.id)
          .run()
          .catch(() => {});
        if (status.status === 'failed') {
          console.warn(`[WEBHOOK] فشل تسليم رسالة ${status.id}:`, JSON.stringify(status.errors || []));
        }
      }
      // 2) رسائل واردة من المدير (اختياري): "توقف" يبطل كل تحديات نشطة للرقم
      for (const msg of value.messages || []) {
        if ((msg.text?.body || '').trim() === 'توقف') {
          await env.DB.prepare(
            `UPDATE auth_challenges SET revoked_at = ? WHERE phone = ? AND revoked_at IS NULL AND consumed_at IS NULL`
          )
            .bind(new Date().toISOString(), msg.from)
            .run()
            .catch(() => {});
        }
      }
    }
  }
}

/** HMAC-SHA256 → hex (للتحقق من توقيع Meta) */
async function hmacSha256Hex(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
