/**
 * worker/auth.js — نواة الأمان: تشفير، جلسات، RBAC على مستوى الحقل،
 * وحدود المعدل. كل الإنفاذ يتم هنا على الخادم (الواجهة مجرد UX).
 *
 * مبادئ التصميم:
 *  1) لا كلمات مرور — الهوية رقم واتساب + كود لمرة واحدة.
 *  2) لا يُخزَّن أي سر نصاً: OTP/توكن الجلسة/الرابط السحري تُخزَّن
 *     كـ SHA-256 مع AUTH_PEPPER (secret في Cloudflare).
 *  3) الجلسة توكن عشوائي 32 بايت داخل Cookie HttpOnly+Secure+SameSite=Strict.
 *  4) الصلاحيات تُقرأ من قاعدة البيانات مع كل طلب (لا تُحفظ في التوكن)
 *     حتى يمكن سحب صلاحية موظف فوراً دون انتظار انتهاء جلسته.
 */

// ============================ Crypto ============================

const encoder = new TextEncoder();

/** SHA-256 → hex */
export async function sha256Hex(input) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Hash "مُتبَّل" لقيمة سرية مؤقتة (OTP / توكن) */
export const secretHash = (env, value) => sha256Hex(`${env.AUTH_PEPPER || 'dev-pepper'}::${value}`);

/** مقارنة زمنية ثابتة (تمنع Timing Attacks) */
export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** توليد توكن عشوائي (hex) بطول بايتات محدد */
export function randomToken(bytes = 32) {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return [...buf].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** توليد كود OTP من 6 أرقام بمصدر عشوائي تشفيري (بدون Module Bias) */
export function randomOtp() {
  const buf = new Uint8Array(4);
  crypto.getRandomValues(buf);
  const n = buf[0] * 2 ** 24 + buf[1] * 2 ** 16 + buf[2] * 2 ** 8 + buf[3]; // 0..2^32-1
  return String((n % 1_000_000).toString()).padStart(6, '0');
}

// ============================ هواتف ============================

/** تطبيع رقم الهاتف إلى E.164 (+ بادئة دولة 1-3 أرقام و9-12 رقماً) */
export function normalizePhone(raw) {
  const digits = String(raw || '').replace(/[^\d+]/g, '');
  let phone = digits.startsWith('+') ? digits : `+${digits}`;
  phone = `+${phone.slice(1).replace(/\D/g, '')}`;
  return /^\+\d{10,15}$/.test(phone) ? phone : null;
}

// ============================ الجلسات ============================

export const SESSION_COOKIE = 'omran_admin_session';
export const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 ساعات
const SESSION_REFRESH_THRESHOLD_MS = 4 * 60 * 60 * 1000; // تجديد إذا بقي أقل من 4 ساعات

/** توليد جلسة جديدة وتخزين hash التوكن في D1 */
export async function createSession(env, admin, request) {
  const token = randomToken(32);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);
  await env.DB.prepare(
    `INSERT INTO admin_sessions (id, admin_id, token_hash, expires_at, user_agent, ip_hash)
     VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?)`
  )
    .bind(
      admin.id,
      await secretHash(env, token),
      expiresAt.toISOString(),
      (request.headers.get('user-agent') || '').slice(0, 250),
      await clientIpHash(env, request)
    )
    .run();
  return { token, expiresAt };
}

/**
 * قراءة الجلسة من الكوكي والتحقق منها مقابل D1.
 * يعيد { session, admin } أو null — ويحدّث last_seen/الصلاحيات من DB دائماً.
 */
export async function resolveSession(env, request) {
  const cookies = request.headers.get('cookie') || '';
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([A-Za-z0-9]{16,128})`));
  if (!match) return null;

  const tokenHash = await secretHash(env, match[1]);
  const row = await env.DB.prepare(
    `SELECT s.*, a.id AS admin_id, a.phone AS admin_phone, a.full_name, a.role,
            a.permissions, a.is_active AS admin_active
     FROM admin_sessions s
     JOIN admin_users a ON a.id = s.admin_id
     WHERE s.token_hash = ?1 AND s.revoked_at IS NULL
       AND datetime(s.expires_at) > datetime('now')
       AND a.is_active = 1
     LIMIT 1`
  )
    .bind(tokenHash)
    .first();
  if (!row) return null;

  // تجديد منزلق صامت
  const expiresMs = new Date(row.expires_at.replace(' ', 'T') + 'Z').getTime();
  if (expiresMs - Date.now() < SESSION_REFRESH_THRESHOLD_MS) {
    const newExpiry = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
    env.DB.prepare('UPDATE admin_sessions SET expires_at = ?, last_seen_at = ? WHERE id = ?')
      .bind(newExpiry, new Date().toISOString(), row.id)
      .run()
      .catch(() => {});
  } else {
    env.DB.prepare('UPDATE admin_sessions SET last_seen_at = ? WHERE id = ?')
      .bind(new Date().toISOString(), row.id)
      .run()
      .catch(() => {});
  }

  let permissions = [];
  try { permissions = JSON.parse(row.permissions || '[]'); } catch { /* [] */ }
  return {
    session: { id: row.id, expires_at: row.expires_at },
    admin: {
      id: row.admin_id,
      phone: row.admin_phone,
      full_name: row.full_name,
      role: row.role,
      permissions,
    },
  };
}

/** رؤوس Set-Cookie لإنشاء/مسح جلسة */
export function sessionCookie(token, maxAge = SESSION_TTL_SECONDS) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}
export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

/** إبطال الجلسة الحالية (تسجيل الخروج) */
export async function revokeSession(env, request) {
  const resolved = await resolveSession(env, request);
  if (!resolved) return null;
  await env.DB.prepare('UPDATE admin_sessions SET revoked_at = ? WHERE id = ?')
    .bind(new Date().toISOString(), resolved.session.id)
    .run();
  return resolved;
}

// ============================ RBAC ============================

/** هل يملك المدير صلاحية معينة؟ ("*" = super_admin) */
export function hasPermission(admin, permission) {
  return admin.permissions.includes('*') || admin.permissions.includes(permission);
}

/**
 * خريطة "الحقل القابل للتعديل في جدول products → الصلاحية المطلوبة".
 * هذه هي الحدود الصارمة للدور المحدود: اسم/سعر/وصف/صورة فقط.
 * أي حقل خارج هذه الخريطة (المخزون، SKU، الفئة، الظهور...) مرفوض
 * للدور المحدود — حتى لو أرسله العميل مباشرة إلى الـ API.
 */
export const PRODUCT_FIELD_PERMISSIONS = {
  name_ar:       'products.name',
  name_en:       'products.name',
  retail_price:  'products.price',
  original_price:'products.price',
  description:   'products.description',
  images:        'products.images',
};

/** الحقول الإضافية التي يستطيع super_admin فقط لمسها */
export const SUPER_ONLY_FIELDS = new Set([
  'is_active', 'stock_quantity', 'sku', 'slug', 'category_id', 'wholesale_price',
  'wholesale_price_tier2', 'wholesale_price_tier3', 'cost_price', 'is_best_seller', 'is_new',
]);

/**
 * فصل حقول PATCH إلى مسموحة/مرفوضة حسب صلاحيات المدير.
 * سياسة "الكل أو لا شيء": أي حقل مرفوض يُسقط الطلب كاملاً (403)
 * مع تسجيل المحاولة في سجل التدقيق — أفضل من التنفيذ الجزئي الصامت.
 */
export function splitPatchFields(body, admin) {
  const allowed = {};
  const denied = [];
  for (const [field, value] of Object.entries(body || {})) {
    const requiredPerm = PRODUCT_FIELD_PERMISSIONS[field];
    if (requiredPerm) {
      if (hasPermission(admin, requiredPerm)) allowed[field] = value;
      else denied.push({ field, reason: `missing_permission:${requiredPerm}` });
    } else if (SUPER_ONLY_FIELDS.has(field) && hasPermission(admin, '*')) {
      allowed[field] = value; // المدير العام فقط
    } else {
      denied.push({ field, reason: SUPER_ONLY_FIELDS.has(field) ? 'super_admin_only' : 'immutable_field' });
    }
  }
  return { allowed, denied };
}

// ============================ حدود المعدل ============================

/**
 * نافذة معدل ثابتة داخل D1.
 * تُعيد { ok, retryAfterSec } — atomic عبر UPSERT.
 */
export async function rateLimit(env, key, limit, windowMs) {
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / windowMs) * windowMs).toISOString();
  const { results } = await env.DB.prepare(
    `INSERT INTO auth_rate_limits (key, window_start, count) VALUES (?1, ?2, 1)
     ON CONFLICT(key) DO UPDATE SET
       count   = CASE WHEN window_start = ?2 THEN count + 1 ELSE 1 END,
       window_start = ?2
     RETURNING count`
  )
    .bind(key, windowStart)
    .all();
  const count = results?.[0]?.count ?? 1;
  return {
    ok: count <= limit,
    count,
    retryAfterSec: Math.ceil((Math.floor(now / windowMs) * windowMs + windowMs - now) / 1000),
  };
}

// ============================ التدقيق/IP ============================

export function clientIp(request) {
  return request.headers.get('cf-connecting-ip') || '0.0.0.0';
}

/** hash للـ IP مع الفلفل — للتدقيق دون حفظ عنوان صريح */
export async function clientIpHash(env, request) {
  return sha256Hex(`${env.AUTH_PEPPER || 'dev-pepper'}::ip::${clientIp(request)}`);
}

/** كتابة سطر تدقيق (best-effort: لا يُفشل الطلب الأصلي) */
export async function audit(env, { admin, action, entityType, entityId, outcome = 'ok', detail, request }) {
  try {
    await env.DB.prepare(
      `INSERT INTO admin_audit_log (id, admin_id, admin_phone, action, entity_type, entity_id, outcome, detail, ip_hash)
       VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        admin?.id || null,
        admin?.phone || null,
        action,
        entityType || null,
        entityId != null ? String(entityId) : null,
        outcome,
        detail ? JSON.stringify(detail) : null,
        request ? await clientIpHash(env, request) : null
      )
      .run();
  } catch (err) {
    console.error('audit write failed:', err);
  }
}

// ============================ CSRF/الأصل ============================

/**
 * للطلبات المُغيِّرة (POST/PATCH/DELETE) على /api/admin/*:
 * الكوكي SameSite=Strict يمنع CSRF عبر المواقع، ونتحقق إضافياً أن
 * الطلب يأتينا من نفس الأصل أو يحمل رأس X-Requested-With المخصص.
 */
export function sameOriginOrXhr(request) {
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin' && site !== 'none') return false;
  const origin = request.headers.get('origin');
  if (origin) {
    try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
  }
  return request.headers.get('x-requested-with') === 'XMLHttpRequest' || site === 'same-origin';
}
