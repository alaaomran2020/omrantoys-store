/**
 * worker/admin.js — المسارات الإدارية. "Route Protection" الفعلي يحدث هنا
 * على الخادم قبل لمس D1 بأي شكل؛ واجهة React مجرد طبقة تجربة مستخدم.
 *
 * │ المسار                            │ الصلاحية المطلوبة            │
 * │ POST /api/admin/auth/request-code │ — (عام + حدود معدل صارمة)     │
 * │ POST /api/admin/auth/verify       │ — (كود/رابط OTP صحيح)         │
 * │ POST /api/admin/auth/logout       │ جلسة صالحة                    │
 * │ GET  /api/admin/auth/me           │ جلسة صالحة                    │
 * │ GET  /api/admin/products          │ جلسة صالحة                    │
 * │ GET  /api/admin/products/:id      │ جلسة صالحة                    │
 * │ PATCH /api/admin/products/:id     │ حقل-بحقل (انظر PRODUCT_FIELD_ │
 * │                                   │ PERMISSIONS في auth.js)       │
 * │ DELETE /api/admin/products/:id    │ products.delete (للمالك فقط)  │
 * │ GET  /api/admin/activity          │ جلسة صالحة                    │
 * │ * أي مسار إداري آخر               │ 404 — لا وجود له أصلاً        │
 *
 * ملاحظة مقصودة: لا يوجد أي مسار "إعدادات نظام" تحت /api/admin/* —
 * الموظف المحدود لا يمكنه تجاوز صلاحياته لأن الخادم لا يعرض هذه
 * القدرة من الأساس (Deny by Default).
 */

import {
  normalizePhone, randomOtp, randomToken, secretHash, timingSafeEqual,
  createSession, resolveSession, revokeSession, sessionCookie, clearSessionCookie,
  hasPermission, splitPatchFields, rateLimit, audit, sameOriginOrXhr, clientIpHash,
} from './auth.js';
import { sendOtpMessage, isDevMode } from './whatsapp.js';

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...extra } });

const unauthorized = (msg = 'جلسة غير صالحة — سجّل الدخول من جديد') => json({ success: false, error: msg }, 401);
const forbidden = (msg, extra = {}) => json({ success: false, error: msg, ...extra }, 403);

const CODE_TTL_MS = 5 * 60 * 1000;        // صلاحية الكود والرابط السحري: 5 دقائق
const RESEND_AFTER_SEC = 60;              // ثانية إعادة الإرسال في الواجهة

// ---------------------------------------------------------------
// المُوجِّه الرئيسي
// ---------------------------------------------------------------
export async function handleAdminApi(request, env, url) {
  const path = url.pathname.replace(/\/+$/, '');
  const method = request.method.toUpperCase();

  // ---- مسارات المصادقة (بدون جلسة) ----
  if (path === '/api/admin/auth/request-code' && method === 'POST') return requestCode(request, env, url);
  if (path === '/api/admin/auth/verify' && method === 'POST') return verifyCode(request, env);

  // ---- من هنا فصاعداً: جلسة إدارية إلزامية ----
  const ctx = await resolveSession(env, request);
  if (!ctx) return unauthorized();

  if (path === '/api/admin/auth/logout' && method === 'POST') {
    await revokeSession(env, request);
    await audit(env, { admin: ctx.admin, action: 'auth.logout', request });
    return json({ success: true }, 200, { 'Set-Cookie': clearSessionCookie() });
  }
  if (path === '/api/admin/auth/me' && method === 'GET') {
    return json({
      success: true,
      admin: ctx.admin,
      session: { expires_at: ctx.session.expires_at },
    });
  }

  // حماية CSRF للطلبات المُغيِّرة (الكوكي Strict + فحص الأصل)
  if (method !== 'GET' && !sameOriginOrXhr(request)) {
    return forbidden('طلب مرفوض: أصل غير موثوق (CSRF guard)');
  }

  if (path === '/api/admin/products' && method === 'GET') return listProducts(env, url);
  if (path === '/api/admin/activity' && method === 'GET') return listActivity(env, ctx);

  const productMatch = path.match(/^\/api\/admin\/products\/([^/]+)$/);
  if (productMatch) {
    const id = decodeURIComponent(productMatch[1]);
    if (method === 'GET') return getProduct(env, id);
    if (method === 'PATCH') return patchProduct(request, env, ctx, id);
    if (method === 'DELETE') return deleteProduct(request, env, ctx, id);
  }

  return json({ success: false, error: 'نقطة نهاية إدارية غير موجودة' }, 404);
}

// ---------------------------------------------------------------
// 1) طلب كود OTP إلى واتساب المدير
// ---------------------------------------------------------------
async function requestCode(request, env, url) {
  if (!sameOriginOrXhr(request)) return forbidden('طلب مرفوض: أصل غير موثوق');

  let body;
  try { body = await request.json(); } catch { return json({ success: false, error: 'JSON غير صالح' }, 400); }
  const phone = normalizePhone(body?.phone);
  if (!phone) return json({ success: false, error: 'رقم واتساب غير صالح — استخدم صيغة دولية مثل +2010xxxxxxxx' }, 400);

  // هل الرقم مسجَّل كمدير نشط أصلاً؟ (لا نكشف للمهاجم إن كان الرقم معروفاً — نفس الرد دائماً تقريباً)
  const admin = await env.DB.prepare('SELECT * FROM admin_users WHERE phone = ? AND is_active = 1')
    .bind(phone).first();
  if (!admin) {
    await audit(env, { action: 'auth.request_code', outcome: 'denied',
      detail: { phone, reason: 'unknown_admin_number' }, request });
    return json({ success: false, error: 'هذا الرقم غير مسجّل كمدير — تواصل مع المالك' }, 403);
  }

  // حدود المعدل: 3 طلبات/15 دقيقة للرقم + 10/ساعة لعنوان IP
  const ipKey = `otp:ip:${await clientIpHash(env, request)}`;
  const [byPhone, byIp] = await Promise.all([
    rateLimit(env, `otp:phone:${phone}`, 3, 15 * 60 * 1000),
    rateLimit(env, ipKey, 10, 60 * 60 * 1000),
  ]);
  if (!byPhone.ok || !byIp.ok) {
    const retry = Math.max(byPhone.ok ? 0 : byPhone.retryAfterSec, byIp.ok ? 0 : byIp.retryAfterSec);
    await audit(env, { admin, action: 'auth.request_code', outcome: 'denied',
      detail: { reason: 'rate_limited', retry_after: retry }, request });
    return json({ success: false, error: `طلبات كثيرة جداً — انتظر ${Math.ceil(retry / 60)} دقيقة`, retry_after: retry },
      429, { 'Retry-After': String(retry) });
  }

  // إبطال أي تحدي نشط سابق ثم إنشاء التحدي الجديد (كود + رابط سحري)
  const now = new Date();
  await env.DB.prepare(
    `UPDATE auth_challenges SET revoked_at = ? WHERE phone = ? AND revoked_at IS NULL AND consumed_at IS NULL`
  ).bind(now.toISOString(), phone).run();

  const code = randomOtp();
  const linkToken = randomToken(24);
  const magicPath = `${url.origin}/#/admin/login?t=${linkToken}&p=${encodeURIComponent(phone)}`;

  const sendResult = await sendOtpMessage(env, phone, code, magicPath);

  await env.DB.prepare(
    `INSERT INTO auth_challenges (id, admin_id, phone, code_hash, link_token_hash, expires_at, message_id)
     VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      admin.id, phone,
      await secretHash(env, code),
      await secretHash(env, linkToken),
      new Date(now.getTime() + CODE_TTL_MS).toISOString(),
      sendResult.messageId || null
    )
    .run();

  await audit(env, { admin, action: 'auth.request_code',
    detail: { delivered: sendResult.delivered, provider_error: sendResult.providerError || null }, request });

  if (!sendResult.delivered) {
    return json({ success: false, error: 'تعذّر إرسال كود الواتساب الآن — حاول بعد قليل',
      provider_error: sendResult.providerError }, 502);
  }

  const response = {
    success: true,
    message: `أرسلنا كوداً من 6 أرقام إلى واتساب ${phone}`,
    expires_in: Math.floor(CODE_TTL_MS / 1000),
    resend_after: RESEND_AFTER_SEC,
    dev_mode: isDevMode(env),
  };
  // في وضع التطوير فقط: نُعيد الكود/الرابط حتى تُختبر الدورة بدون مزوّد حقيقي
  if (isDevMode(env) && env.AUTH_DEV_MODE === '1') {
    response.dev_code = sendResult.devCode;
    response.dev_magic_url = sendResult.devMagicUrl;
  }
  return json(response);
}

// ---------------------------------------------------------------
// 2) التحقق من الكود (أو الرابط السحري) وإنشاء الجلسة
// ---------------------------------------------------------------
async function verifyCode(request, env) {
  if (!sameOriginOrXhr(request)) return forbidden('طلب مرفوض: أصل غير موثوق');

  let body;
  try { body = await request.json(); } catch { return json({ success: false, error: 'JSON غير صالح' }, 400); }

  const nowIso = new Date().toISOString();
  let challenge = null;
  let isAdminAuthenticated = false; // هل نجح التحقق؟

  // ---- مسار الرابط السحري: /api/admin/auth/verify { token } ----
  if (body?.token) {
    const tokenHash = await secretHash(env, String(body.token));
    challenge = await env.DB.prepare(
      `SELECT c.*, a.is_active AS admin_active FROM auth_challenges c
         JOIN admin_users a ON a.id = c.admin_id
        WHERE c.link_token_hash = ? AND c.revoked_at IS NULL AND c.consumed_at IS NULL
          AND c.expires_at > ? LIMIT 1`
    ).bind(tokenHash, nowIso).first();
    if (!challenge) return json({ success: false, error: 'الرابط منتهٍ أو مستهلك — اطلب كوداً جديداً' }, 401);
    isAdminAuthenticated = true;
  } else {
    // ---- مسار الكود: { phone, code } ----
    const phone = normalizePhone(body?.phone);
    const code = String(body?.code || '').trim();
    if (!phone || !/^\d{6}$/.test(code)) return json({ success: false, error: 'أدخل الرقم وكوداً من 6 أرقام' }, 400);

    challenge = await env.DB.prepare(
      `SELECT c.*, a.is_active AS admin_active FROM auth_challenges c
         JOIN admin_users a ON a.id = c.admin_id
        WHERE c.phone = ? AND c.revoked_at IS NULL AND c.consumed_at IS NULL
        ORDER BY c.created_at DESC LIMIT 1`
    ).bind(phone).first();

    if (!challenge || challenge.expires_at <= nowIso) {
      return json({ success: false, error: 'انتهت صلاحية الكود — اطلب كوداً جديداً' }, 401);
    }

    // حد المحاولات لكل تحدٍ (منع التخمين: 5 محاولات ثم إبطال)
    if (challenge.attempts >= challenge.max_attempts) {
      await env.DB.prepare('UPDATE auth_challenges SET revoked_at = ? WHERE id = ?')
        .bind(nowIso, challenge.id).run();
      return json({ success: false, error: 'تجاوزت عدد المحاولات — اطلب كوداً جديداً' }, 429);
    }

    const codeHash = await secretHash(env, code);
    if (!timingSafeEqual(codeHash, challenge.code_hash)) {
      await env.DB.prepare('UPDATE auth_challenges SET attempts = attempts + 1 WHERE id = ?')
        .bind(challenge.id).run();
      const left = challenge.max_attempts - challenge.attempts - 1;
      return json({ success: false, error: `الكود غير صحيح${left > 0 ? ` — تبقّت ${left} محاولات` : ''}` }, 401);
    }
    isAdminAuthenticated = true;
  }

  if (!isAdminAuthenticated || !challenge.admin_active) {
    return unauthorized('الحساب غير نشط');
  }

  // استهلاك التحدي (استخدام واحد) + إنشاء الجلسة + تحديث آخر دخول
  await env.DB.prepare('UPDATE auth_challenges SET consumed_at = ? WHERE id = ?')
    .bind(nowIso, challenge.id).run();

  const admin = await env.DB.prepare('SELECT * FROM admin_users WHERE id = ? AND is_active = 1')
    .bind(challenge.admin_id).first();
  const { token } = await createSession(env, admin, request);

  await env.DB.prepare('UPDATE admin_users SET last_login_at = ?, updated_at = ? WHERE id = ?')
    .bind(nowIso, nowIso, admin.id).run();
  await audit(env, { admin: { id: admin.id, phone: admin.phone }, action: 'auth.login',
    detail: { method: body?.token ? 'magic_link' : 'otp_code' }, request });

  let permissions = [];
  try { permissions = JSON.parse(admin.permissions || '[]'); } catch { /* [] */ }

  return json({
    success: true,
    admin: { id: admin.id, phone: admin.phone, full_name: admin.full_name, role: admin.role, permissions },
  }, 200, { 'Set-Cookie': sessionCookie(token) });
}

// ---------------------------------------------------------------
// 3) قراءة المنتجات (للمدراء)
// ---------------------------------------------------------------
function parseRow(row) {
  if (!row) return row;
  const out = { ...row };
  for (const key of ['images', 'features', 'tags', 'age_range']) {
    if (typeof out[key] === 'string' && out[key]) {
      try { out[key] = JSON.parse(out[key]); } catch { /* يبقى نصاً */ }
    }
  }
  return out;
}

async function listProducts(env, url) {
  const search = (url.searchParams.get('search') || '').trim();
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10) || 20, 100);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);

  let query = 'SELECT id, sku, name_ar, name_en, retail_price, original_price, description, images, is_active, stock_quantity, category_id, updated_at FROM products';
  const params = [];
  if (search) {
    query += ' WHERE name_ar LIKE ? OR name_en LIKE ? OR sku LIKE ?';
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  query += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const { results } = await env.DB.prepare(query).bind(...params).all();
  const { total } = await env.DB.prepare(
    search
      ? 'SELECT COUNT(*) AS total FROM products WHERE name_ar LIKE ? OR name_en LIKE ? OR sku LIKE ?'
      : 'SELECT COUNT(*) AS total FROM products'
  ).bind(...(search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [])).first();

  return json({ success: true, total, products: results.map(parseRow) });
}

async function getProduct(env, id) {
  const row = await env.DB.prepare('SELECT * FROM products WHERE id = ?1 OR sku = ?1').bind(id).first();
  if (!row) return json({ success: false, error: 'المنتج غير موجود' }, 404);
  return json({ success: true, product: parseRow(row) });
}

// ---------------------------------------------------------------
// 4) PATCH منتج — الإنفاذ الحقل-بحقل (جوهر الصلاحيات المحدودة)
// ---------------------------------------------------------------
const VALIDATORS = {
  name_ar:        (v) => (typeof v === 'string' && v.trim() && v.trim().length <= 200 ? v.trim() : INVALID),
  name_en:        (v) => (v == null || v === '' ? null : (typeof v === 'string' && v.length <= 200 ? v.trim() || null : INVALID)),
  // سعر البيع إلزامي — الفراغ/القيمة غير الرقمية مرفوضة (عمود NOT NULL)
  retail_price:   (v) => (v == null || v === '' ? INVALID : (Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= 10_000_000 ? Math.round(Number(v) * 100) / 100 : INVALID)),
  original_price: (v) => (v == null || v === '' ? null : (Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= 10_000_000 ? Math.round(Number(v) * 100) / 100 : INVALID)),
  description:    (v) => (v == null ? null : (typeof v === 'string' && v.length <= 5000 ? v.trim() || null : INVALID)),
  images: (v) => {
    if (!Array.isArray(v) || v.length > 8) return INVALID;
    const clean = v.filter((s) => typeof s === 'string' && /^\/|https?:\/\//.test(s.trim()) && s.trim().length <= 500)
                  .map((s) => s.trim());
    return clean.length === v.length ? JSON.stringify(clean) : INVALID;
  },
};
const INVALID = Symbol('invalid');

async function patchProduct(request, env, ctx, id) {
  const exists = await env.DB.prepare('SELECT id, name_ar FROM products WHERE id = ?1 OR sku = ?1').bind(id).first();
  if (!exists) return json({ success: false, error: 'المنتج غير موجود' }, 404);

  let body;
  try { body = await request.json(); } catch { return json({ success: false, error: 'JSON غير صالح' }, 400); }

  // ① حماية المسار: هل يملك المدير "products.update" أصلاً؟
  const canUpdate = ctx.admin.permissions.includes('*') ||
    ['products.name', 'products.price', 'products.description', 'products.images']
      .some((p) => hasPermission(ctx.admin, p));
  if (!canUpdate) {
    await audit(env, { admin: ctx.admin, action: 'product.update', entityId: id, outcome: 'denied',
      detail: { reason: 'missing_permission:products.update' }, request });
    return forbidden('لا تملك صلاحية تعديل المنتجات');
  }

  // ② حماية على مستوى الحقل: كل حقل يُفحص ضد خريطة الصلاحيات
  const { allowed, denied } = splitPatchFields(body, ctx.admin);
  if (denied.length > 0) {
    // محاولة تجاوز الصلاحيات → رفض كامل + تسجيل تدقيقي
    await audit(env, { admin: ctx.admin, action: 'product.update', entityId: id, outcome: 'denied',
      detail: { reason: 'forbidden_fields', fields: denied, hint: 'الحد المسموح: الاسم/السعر/الوصف/الصور فقط' }, request });
    return forbidden('حقل أو أكثر خارج نطاق صلاحياتك — المسموح: الاسم، السعر، الوصف، الصورة فقط', {
      denied_fields: denied,
    });
  }
  if (Object.keys(allowed).length === 0) {
    return json({ success: false, error: 'لا توجد حقول مسموحة في الطلب' }, 400);
  }

  // ③ تحقق القيم (Validation) ثم بناء UPDATE بمعاملات مرتبطة فقط
  const columns = [];
  const values = [];
  for (const [field, value] of Object.entries(allowed)) {
    const validated = VALIDATORS[field]?.(value) ?? INVALID;
    if (validated === INVALID) {
      return json({ success: false, error: `قيمة غير صالحة للحقل ${field}` }, 400);
    }
    columns.push(`${field} = ?`);
    values.push(validated);
  }
  columns.push('updated_at = CURRENT_TIMESTAMP');
  values.push(exists.id);

  await env.DB.prepare(`UPDATE products SET ${columns.join(', ')} WHERE id = ?`).bind(...values).run();

  await audit(env, { admin: ctx.admin, action: 'product.update', entityType: 'product', entityId: exists.id,
    detail: { fields: Object.keys(allowed) }, request });

  const row = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(exists.id).first();
  return json({ success: true, product: parseRow(row), updated_fields: Object.keys(allowed) });
}

// ---------------------------------------------------------------
// 5) DELETE منتج — محجوز للمالك فقط (الموظف المحدود يُرفض دائماً)
// ---------------------------------------------------------------
async function deleteProduct(request, env, ctx, id) {
  if (!hasPermission(ctx.admin, 'products.delete')) {
    await audit(env, { admin: ctx.admin, action: 'product.delete', entityId: id, outcome: 'denied',
      detail: { reason: 'missing_permission:products.delete' }, request });
    return forbidden('حذف المنتجات غير مسموح لصلاحيتك — متاح للمالك فقط');
  }
  const exists = await env.DB.prepare('SELECT id FROM products WHERE id = ?1 OR sku = ?1').bind(id).first();
  if (!exists) return json({ success: false, error: 'المنتج غير موجود' }, 404);

  // حذف ناعم (إخفاء) حفاظاً على تاريخ الطلبات
  await env.DB.prepare("UPDATE products SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(exists.id).run();
  await audit(env, { admin: ctx.admin, action: 'product.delete', entityType: 'product', entityId: exists.id,
    detail: { soft_delete: true }, request });
  return json({ success: true, soft_deleted: true });
}

// ---------------------------------------------------------------
// 6) نشاط المدير الأخير (سجل التدقيق الشخصي)
// ---------------------------------------------------------------
async function listActivity(env, ctx) {
  const { results } = await env.DB.prepare(
    `SELECT action, entity_type, entity_id, outcome, detail, created_at
       FROM admin_audit_log WHERE admin_id = ? ORDER BY created_at DESC LIMIT 10`
  ).bind(ctx.admin.id).all();
  return json({ success: true, activity: results.map((r) => ({ ...r, detail: safeParse(r.detail) })) });
}
const safeParse = (s) => { try { return s ? JSON.parse(s) : null; } catch { return s; } };
