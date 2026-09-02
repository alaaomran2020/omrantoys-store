# 🔐 هندسة نظام الدخول عبر واتساب — لوحة إدارة متجر عمران

> **البنية**: Cloudflare Workers + D1 · بدون كلمات مرور · بدون Vercel · الواجهة React + Tailwind (تُقدَّم كـ Static Assets من نفس الـ Worker)

هذا المستند هو **"الشرح المنطقي"** لهيكلة المصادقة عبر واتساب كما طُلبت، مع تفاصيل هندسة الـ Webhook وطبقات حماية المسارات (Route Protection) والصلاحيات المحدودة (RBAC).

---

## 1) نظرة معمارية شاملة

```
┌──────────────┐   ①رقم الهاتف    ┌─────────────────────────────┐
│  المتصفح      │ ───────────────▶ │   Cloudflare Worker          │
│  #/admin      │                  │   /api/admin/auth/request-code│
└──────┬───────┘                  └──────────┬──────────────────┘
       │                                     │ ②تحقق: هل الرقم في admin_users؟
       │                                     │ ③حدود المعدل (D1: auth_rate_limits)
       │                                     │ ④توليد OTP 6 أرقام + توكن رابط سحري
       │                                     ▼
       │                           ┌─────────────────────────────┐
       │                           │  WhatsApp Cloud API (Meta)   │
       │                           │  قالب authentication معتمد   │
       │                           └──────────┬──────────────────┘
       │                                     │ ⑤رسالة واتساب → هاتف المدير
       │  ⑥المدير يُدخل الكود                ▼ (أو يضغط الرابط السحري)
       │ ────────────────────────────────────────┐
       │                                          ▼
       │                           /api/admin/auth/verify
       │                           ⑦hash(code+PEPPER) مقارنة زمنية ثابتة
       │                           ⑧إنشاء جلسة: توكن 32 بايت → يُخزَّن hash فقط
       │ ◀── Cookie HttpOnly+Secure+SameSite=Strict ──┘
       │
       │  ⑦' كل طلب إداري: resolveSession() يقرأ الجلسة
       │      والصلاحيات من D1 لحظياً (سحب الصلاحية فوري)
       ▼
   PATCH /api/admin/products/:id  ──▶  إنفاذ حقل-بحقل + سجل تدقيق
```

**لماذا هذه البنية؟**
- **بلا كلمات مرور**: الهوية = حيازة رقم الواتساب الشخصي. لا شيء يُسرَّب من قاعدة البيانات لأن الأسرار كلها مخزنة كـ hash.
- **Edge-first**: التحقق كله يجري في Worker قرب المستخدم، وD1 هو مصدر الحقيقة الوحيد (جلسات/صلاحيات/تدقيق/حدود معدل) — لا حاجة لخدمة جلسات خارجية.
- **قابلية سحب فورية**: الصلاحيات تُقرأ من D1 مع *كل* طلب، وليست مطبوعة داخل التوكن — عطّل الموظف من `admin_users.is_active` تُمَت جلسته فوراً.

---

## 2) دورة المصادقة خطوة بخطوة

| # | الخطوة | التنفيذ |
|---|--------|---------|
| ① | إدخال رقم الواتساب | `POST /api/admin/auth/request-code` — يطبّع الرقم إلى E.164 |
| ② | هل الرقم مدير مسجَّل؟ | `admin_users WHERE phone=? AND is_active=1` — رفض 403 للأرقام الغريبة |
| ③ | حدود المعدل | 3 طلبات/15 دقيقة لكل رقم + 10/ساعة لكل IP (نوافذ ثابتة داخل D1 عبر UPSERT ذري) |
| ④ | توليد الأسرار | OTP من `crypto.getRandomValues` (بلا انحياز Modulo) + توكن رابط 24 بايت |
| ⑤ | الإرسال | WhatsApp Cloud API — قالب **authentication** معتمد مسبقاً (وزر copy_code/autofill) |
| ⑥ | التخزين | يُخزَّن فقط `sha256(AUTH_PEPPER + code)` و`sha256(PEPPER + token)` في `auth_challenges` مع انتهاء 5 دقائق وحد 5 محاولات |
| ⑦ | التحقق | مقارنة الـ digests بـ **timing-safe** — ثم استهلاك التحدي (استخدام واحد) |
| ⑧ | الجلسة | توكن 32 بايت في كوكي `HttpOnly; Secure; SameSite=Strict` (8 ساعات + تجديد منزلق)، و`sha256(PEPPER+token)` وحده في D1 |
| ⑨ | كل طبع لاحق | `resolveSession()` يقرأ الكوكي → hash → D1 → صلاحيات حية |

**الرابط السحري (Magic Link)**: رسالة الواتساب تحوي زر "تسجيل الدخول" يفتح
`/#/admin/login?t=<token>&p=<phone>` فيتحقق المتصفح تلقائياً عبر
`POST /api/admin/auth/verify { token }`. التوكن أحادي الاستخدام ولمرة واحدة
(أعدنا استخدام توكن مستهلَك في الاختبار → 401 ✓).

> **قيد Meta يجب معرفته**: قوالب *authentication* تدعم أزرار OTP (نسخ/تعبئة) وليس أزرار URL. الرابط السحري يتطلب قالب *utility* ثانياً بزر URL، أو أي مزوّد بديل (Twilio WhatsApp/360dialog) — طبقة المزوّد معزولة في `worker/whatsapp.js` (`sendOtpMessage`) فالتبديل لا يمس منطق المصادقة.

---

## 3) هندسة الـ Webhook (`/api/webhooks/whatsapp`)

### أ) اشتراك الـ Webhook (GET)
عند إضافة رابط الـ Webhook في **Meta App Dashboard → WhatsApp → Configuration**، يرسل Meta:
```
GET /api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=XXX&hub.challenge=1234567
```
الـ Worker يعيد `hub.challenge` نصاً **فقط إذا طابق** `hub.verify_token` سرّ `WHATSAPP_VERIFY_TOKEN` (مقارنة زمنية ثابتة) — وإلا 403. *(تم اختباره: توكن خاطئ → Forbidden ✓)*

### ب) استقبال الأحداث (POST)
```
POST /api/webhooks/whatsapp
X-Hub-Signature-256: sha256=<HMAC-SHA256(rawBody, WHATSAPP_APP_SECRET)>
```
1. **التحقق من التوقيع أولاً**: نعيد حساب HMAC على الجسم الخام ونقارن بثبات زمني — أي إشعار مُزيَّف يُرفض 403. (لماذا الجسم الخام وليس المُعاد تحليله؟ لأن أي تغيير حرف واحد يُفسد التوقيع.)
2. **الرد 200 فوراً** (يُعيد Meta المحاولة عند التأخير)، والمعالجة خفيفة:
   - `statuses[]`: تحديث `auth_challenges.delivery_status` عبر `message_id` الذي خزّناه لحظة الإرسال → لو `failed` نعرف أن الكود لم يصل (مفيد لتشخيص شكاوى الدخول).
   - `messages[]`: إرسال "توقف" من واتساب المدير يُبطل كل التحديات النشطة لرقمه (خروج طارئ).
3. **الحماية من الإعادة/الفيضان**: الـ Worker بلا حالة والمعالجة O(1) استعلامات؛ ويمكن ربط Rate Limiting rule على المسار من لوحة Cloudflare.

### ج) وضع التطوير `dev`
بدون مفاتيح Meta (`WHATSAPP_PROVIDER=dev` أو `AUTH_DEV_MODE=1`):
- الكود لا يُرسل فعلياً؛ يُطبع في سجل الـ Worker (`wrangler dev`).
- إن كان `AUTH_DEV_MODE=1` يُعاد الكود في استجابة الـ API وتعرضه الواجهة في شريط "وضع التطوير" — **لهذا اشتغلت الدورة كاملة في المعاينة الحية بدون حساب Meta**.

---

## 4) حماية المسارات والصلاحيات (Route Protection + RBAC)

### طبقات الدفاع (من الخارج للداخل)
1. **خادم أولاً (الحماية الحقيقية)** — `worker/admin.js`: كل مسار تحت `/api/admin/*` يمر عبر `resolveSession()`؛ بلا كوكي صالح = **401** قبل أي استعلام. *(اختبار ✓)*
2. **مصفوفة المسار↔الصلاحية**: `DELETE /api/admin/products/:id` يتطلب `products.delete` — الموظف المحدود يستحق **403 + سجل تدقيق** حتى لو استخدم curl مباشرة. *(اختبار ✓)*
3. **الإنفاذ حقل-بحقل** — `PRODUCT_FIELD_PERMISSIONS` في `worker/auth.js`:

   | الحقل في D1 | الصلاحية المطلوبة | limited_admin |
   |---|---|---|
   | `name_ar`, `name_en` | `products.name` | ✔ |
   | `retail_price`, `original_price` | `products.price` | ✔ |
   | `description` | `products.description` | ✔ |
   | `images` | `products.images` | ✔ |
   | `sku`, `stock_quantity`, `is_active`, `category_id`, أسعار الجملة… | `*` (مالك فقط) | ✘ 403 |

   سياسة **"الكل أو لا شيء"**: حقل واحد مرفوض يُسقط الطلب كاملاً ويُسجَّل بالمحاولة:
   ```json
   {"success":false,"error":"حقل أو أكثر خارج نطاق صلاحياتك…",
    "denied_fields":[{"field":"stock_quantity","reason":"super_admin_only"}]}
   ```
   *(اختبار ✓ — حتى لو عُبث بـ React وحُذفت الأقفال من الواجهة)*
4. **Deny by Default**: لا توجد أصلاً نقاط نهاية للإعدادات/الطلبات تحت `/api/admin/*` — ما لا يوجد لا يُخترق.
5. **CSRF**: الكوكي `SameSite=Strict` + فحص `Sec-Fetch-Site/Origin` أو رأس `X-Requested-With` لكل طلب مُغيِّر. *(اختبار بدون الرأس → 403 ✓)*
6. **حارس الواجهة (UX)** — `src/admin/AdminApp.jsx`: لا تُرسم أي شاشة بيانات قبل `GET /api/admin/auth/me`، والحقول المقفلة `disabled` مع `LockBadge`، وزر الحذف معطّل بتلميح صريح.

### سجل التدقيق (admin_audit_log)
كل حدث يُخزَّن — **بما فيه المحاولات المرفوضة**:
```
product.update  ok      {"fields":["name_ar","retail_price"]}
product.update  denied  {"reason":"forbidden_fields","fields":[...stock_quantity...]}
product.delete  denied  {"reason":"missing_permission:products.delete"}
auth.login      ok      {"method":"otp_code"}
auth.request_code denied {"reason":"rate_limited","retry_after":133}
```
مع hash للـ IP (`sha256(PEPPER::ip)`) للتحقيق دون التعقب.

---

## 5) المخطط الدلالي للجداول (Migration 0003)

| الجدول | الدور | أبرز الضوابط |
|---|---|---|
| `admin_users` | الهوية والأدوار | `phone UNIQUE E.164`, `role CHECK(super_admin/limited_admin)`, `permissions JSON`, `is_active` |
| `auth_challenges` | تحديات OTP/الرابط | hash فقط، `expires_at` (5 دقائق)، `attempts/max_attempts=5`، `consumed_at`، `message_id` |
| `admin_sessions` | الجلسات | `token_hash UNIQUE`، `expires_at`، `revoked_at`، `ip_hash` |
| `admin_audit_log` | التدقيق | `outcome CHECK(ok/denied/error)`، `detail JSON` |
| `auth_rate_limits` | نوافذ المعدل | UPSERT ذري بـ `RETURNING count` |

---

## 6) متغيرات البيئة (Cloudflare)

```bash
# أسرار الإنتاج (لا تُضعها في wrangler.toml):
npx wrangler secret put AUTH_PEPPER            # فلفل عشوائي طويل (openssl rand -hex 32)
npx wrangler secret put WHATSAPP_TOKEN         # رمز الوصول الدائم من Meta
npx wrangler secret put WHATSAPP_PHONE_NUMBER_ID
npx wrangler secret put WHATSAPP_VERIFY_TOKEN  # رمز اشتراك الـ Webhook
npx wrangler secret put WHATSAPP_APP_SECRET    # للتحقق من X-Hub-Signature-256
# اختيارية:
npx wrangler secret put WHATSAPP_OTP_TEMPLATE  # اسم القالب (افتراضي omran_admin_login)
npx wrangler secret put WHATSAPP_TEMPLATE_LANG # افتراضي ar
```
محلياً كلها في `.dev.vars` (مستثنى من Git). **لا يوجد أي مرجع لـ Vercel في المشروع** — النشر عبر `npm run deploy` (wrangler).

### خطوات الإعداد في Meta (مرة واحدة)
1. إنشاء App من نوع *Business* → إضافة منتج **WhatsApp**.
2. اعتماد قالب رسالة تصنيف **authentication** (زر copy_code) باسم `omran_admin_login`.
3. Webhook → Callback URL: `https://<your-worker>.workers.dev/api/webhooks/whatsapp` وVerify Token = `WHATSAPP_VERIFY_TOKEN`.
4. الاشتراك في حقل `messages` (يشمل `statuses` تلقائياً).

---

## 7) التشغيل والاختبار

```bash
npm run db:d1:migrate        # تطبيق الـ migrations محلياً
node scripts/seed-d1-products.mjs && npx wrangler d1 execute DB --local --file=cloudflare/d1-seed-products.sql
npm run cf:dev               # بناء + wrangler dev (يقرأ .dev.vars)
```
ثم افتح `http://localhost:8787/#/admin`:

| الحساب التجريبي | الرقم | ما يستطيعه |
|---|---|---|
| المالك | `+201000000001` | كل شيء + الحذف الناعم |
| الموظف المحدود | `+201000000002` | تعديل الاسم/السعر/الوصف/الصور **فقط** |

> ⚠️ **قبل الإنتاج**: غيّر رقمي الـ Seed في `migrations/0003_admin_whatsapp_auth.sql` إلى أرقامك الحقيقية، وضع `AUTH_DEV_MODE` فارغاً/محذوفاً حتى لا يُعاد الكود في الاستجابة.
