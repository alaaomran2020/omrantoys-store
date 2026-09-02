-- ============================================================
-- Migration 0003: نظام مصادقة المدراء عبر واتساب + RBAC
-- Omran Toys — Admin WhatsApp OTP Authentication
--
-- مبني على Cloudflare D1 (SQLite) ويُدار بالكامل من الـ Worker.
-- لا يوجد أي كلمة مرور: الهوية = رقم الواتساب الشخصي (E.164).
--
-- جداول:
--   admin_users       المدراء وأدوارهم وصلاحياتهم (JSON)
--   auth_challenges   تحديات OTP (كود 6 أرقام + رابط سحري) مُخزّنة كـ hash فقط
--   admin_sessions    جلسات المدراء (token hash + انتهاء + إبطال)
--   admin_audit_log   سجل تدقيق لكل فعل إداري (ناجح أو مرفوض)
--   auth_rate_limits  حدود المعدل (Anti-Bruteforce) داخل D1
--
-- ملاحظات أمنية:
--   * لا يُخزَّن الكود أو التوكن نصاً أبداً — فقط SHA-256 مع "فلفل" Pepper
--     (AUTH_PEPPER secret) بحيث لا تكفي قاعدة البيانات وحدها لتزوير جلسة.
--   * RLS غير متاحة في D1 → الإنفاذ يتم في الـ Worker (route + field level).
-- ============================================================

-- 1) المدراء -------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  phone        TEXT NOT NULL UNIQUE,               -- بصيغة E.164 مثل +201000000002
  full_name    TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'limited_admin'
               CHECK (role IN ('super_admin', 'limited_admin')),
  permissions  TEXT NOT NULL DEFAULT '[]',          -- JSON: ["products.name", ...] أو ["*"]
  is_active    INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at   TEXT DEFAULT CURRENT_TIMESTAMP,
  last_login_at TEXT
);

-- 2) تحديات المصادقة (OTP / Magic Link) ----------------------
-- يُنشأ تحدٍ واحد نشط لكل رقم: أي طلب جديد يُبطل القديم فوراً.
CREATE TABLE IF NOT EXISTS auth_challenges (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  admin_id        TEXT NOT NULL REFERENCES admin_users(id),
  phone           TEXT NOT NULL,
  code_hash       TEXT NOT NULL,                    -- sha256(pepper + code)
  link_token_hash TEXT,                             -- sha256(pepper + token) للرابط السحري
  channel         TEXT NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp')),
  attempts        INTEGER NOT NULL DEFAULT 0,       -- محاولات التحقق (حد أقصى 5)
  max_attempts    INTEGER NOT NULL DEFAULT 5,
  expires_at      TEXT NOT NULL,                    -- 5 دقائق للكود / 10 للرابط
  consumed_at     TEXT,                             -- وقت الاستهلاك (يُستخدم مرة واحدة)
  revoked_at      TEXT,
  delivery_status TEXT DEFAULT 'pending',           -- تُحدَّث من الـ Webhook: sent/delivered/failed
  message_id      TEXT,                             -- معرّف رسالة WhatsApp لربط إشعارات الـ Webhook
  created_at      TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_challenges_phone    ON auth_challenges(phone, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenges_link    ON auth_challenges(link_token_hash);
CREATE INDEX IF NOT EXISTS idx_challenges_message ON auth_challenges(message_id);

-- 3) الجلسات --------------------------------------------------
-- التوكن الخام (32 بايت عشوائي) يُرسل في Cookie HttpOnly فقط،
-- وقاعدة البيانات تحفظ sha256(pepper + token) للمقارنة.
CREATE TABLE IF NOT EXISTS admin_sessions (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  admin_id     TEXT NOT NULL REFERENCES admin_users(id),
  token_hash   TEXT NOT NULL UNIQUE,
  expires_at   TEXT NOT NULL,                       -- 8 ساعات مع تجديد منزلق
  created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TEXT DEFAULT CURRENT_TIMESTAMP,
  revoked_at   TEXT,
  user_agent   TEXT,
  ip_hash      TEXT                                  -- hash للـ IP للتحقيق وليس للتعقب
);
CREATE INDEX IF NOT EXISTS idx_sessions_admin ON admin_sessions(admin_id);

-- 4) سجل التدقيق ----------------------------------------------
-- كل طلب كتابة يُسجَّل: من، ماذا، متى، وأيضاً المحاولات *المرفوضة*
-- (مثلاً: موظف حاول تعديل المخزون أو حذف منتج → denied_action).
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  admin_id    TEXT,
  admin_phone TEXT,
  action      TEXT NOT NULL,                        -- login / product.update / product.delete.denied ...
  entity_type TEXT,
  entity_id   TEXT,
  outcome     TEXT NOT NULL DEFAULT 'ok' CHECK (outcome IN ('ok', 'denied', 'error')),
  detail      TEXT,                                 -- JSON: الحقول المتغيرة أو سبب الرفض
  ip_hash     TEXT,
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_admin ON admin_audit_log(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_time  ON admin_audit_log(created_at DESC);

-- 5) حدود المعدل (نافذة ثابتة داخل D1) ----------------------
-- مفاتيح مثل: otp:phone:+201000000002  (3 طلبات / 15 دقيقة)
--             otp:ip:<hash>             (10 طلبات / ساعة)
CREATE TABLE IF NOT EXISTS auth_rate_limits (
  key          TEXT PRIMARY KEY,
  window_start TEXT NOT NULL,
  count        INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- Seed: حسابان افتراضيان — **غيّر الأرقام قبل النشر الإنتاجي**
--   super_admin   → كل الصلاحيات ["*"]
--   limited_admin → فقط: الاسم، السعر، الوصف، الصورة (لا حذف ولا إعدادات)
-- ============================================================
INSERT INTO admin_users (phone, full_name, role, permissions) VALUES
  ('+201000000001', 'المالك — مدير عام', 'super_admin', '["*"]'),
  ('+201000000002', 'موظف تحرير المنتجات', 'limited_admin',
   '["products.name", "products.price", "products.description", "products.images"]')
ON CONFLICT(phone) DO NOTHING;
