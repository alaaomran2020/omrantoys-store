# 🚀 دليل النشر على Cloudflare | Omran Toys Store

## ✅ الحالة الحالية

المشروع جاهز للنشر على Cloudflare Workers with Static Assets.

- ✅ Build يعمل بنجاح
- ✅ Lint نظيف (0 أخطاء، 0 تحذيرات)
- ✅ D1 binding معطّل (غير مستخدم حالياً)
- ✅ SPA routing مُعدّ
- ✅ Scripts جاهزة

---

## 📋 الخطوات المطلوبة للنشر

### 1. التثبيت الأولي (مرة واحدة)

```bash
# تثبيت Wrangler globally (إن لم يكن مثبتاً)
npm install -g wrangler

# تسجيل الدخول إلى Cloudflare
npx wrangler login
```

### 2. النشر الأول

```bash
# بناء المشروع ونشره
npm run deploy
```

هذا الأمر:
1. ينفذ `npm run build` (ينتج مجلد `dist/`)
2. يرفع `dist/` إلى Cloudflare Workers
3. يُنشئ URL مؤقت: `https://omrantoys-store.<your-subdomain>.workers.dev`

### 3. ربط الدومين المخصص (omrantoys.store)

#### من Cloudflare Dashboard:

1. اذهب إلى **Workers & Pages** → `omrantoys-store`
2. اضغط **Settings** → **Domains & Routes**
3. اضغط **Add** → **Custom Domain**
4. أدخل: `omrantoys.store`
5. اختر Zone الخاص بالدومين
6. اضغط **Add Custom Domain**

Cloudflare سيُعدّ DNS records تلقائياً.

### 4. النشر التلقائي (اختياري)

#### الخيار أ: Cloudflare Git Integration (الأسهل)

1. من Cloudflare Dashboard → **Workers & Pages**
2. اضغط **Create application** → **Pages** → **Connect to Git**
3. اختر repository: `alaaomran2020/omrantoys-store`
4. إعدادات Build:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
5. احفظ وانشر

#### الخيار ب: GitHub Actions

أنشئ ملف `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm run build
      
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

**الـ Secrets المطلوبة في GitHub:**
- `CLOUDFLARE_API_TOKEN`: من Cloudflare Dashboard → **My Profile** → **API Tokens** → **Create Token** → **Edit Cloudflare Workers**
- `CLOUDFLARE_ACCOUNT_ID`: من Cloudflare Dashboard → **Overview** (في الشريط الجانبي)

---

## 🔐 Environment Variables

المتغيرات التالية **اختيارية** - التطبيق يعمل بدونها (fallback mode):

### Supabase (اختياري)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
**مكان الإضافة**: Cloudflare Dashboard → Workers → `omrantoys-store` → **Settings** → **Variables** → **Environment Variables**

⚠️ **مهم**: بعد إضافة المتغيرات، أعد بناء المشروع محلياً وانشره مرة أخرى:
```bash
npm run deploy
```

### بوابات الدفع (اختيارية)
```bash
VITE_PAYMOB_API_KEY=your-paymob-api-key
VITE_PAYMOB_INTEGRATION_ID=your-integration-id
VITE_PAYMOB_IFRAME_ID=your-iframe-id

VITE_FAWRY_MERCHANT_CODE=your-merchant-code
VITE_FAWRY_SECURITY_KEY=your-security-key
```

### Analytics (اختياري)
```bash
VITE_GA4_ID=G-XXXXXXXXXX
VITE_META_PIXEL_ID=XXXXXXXXXXXXXXX
```

### معلومات المتجر
```bash
VITE_WHATSAPP_NUMBER=201555570269
```

---

## 🗄️ Cloudflare D1 (للمستقبل)

D1 **غير مستخدم حالياً** - التطبيق يستخدم Supabase مع fallback إلى localStorage.

### عند الحاجة لـ D1 مستقبلاً:

1. **إنشاء قاعدة بيانات D1:**
```bash
npx wrangler d1 create omran-toys-db
```
الناتج سيعطيك `database_id` حقيقي.

2. **تعديل `wrangler.toml`:**
```toml
[[d1_databases]]
binding = "DB"
database_name = "omran-toys-db"
database_id = "YOUR_REAL_DATABASE_ID"  # ← ضع الـ ID هنا
```

3. **تطبيق الـ Schema:**
```bash
npx wrangler d1 execute DB --remote --file=cloudflare/d1-schema.sql
```

4. **اختبار محلي:**
```bash
npm run db:d1:test
```

---

## 🧪 الاختبار المحلي

```bash
# تثبيت المكتبات
npm install

# تشغيل السيرفر المحلي
npm run dev
# → http://localhost:5173

# بناء الإنتاج
npm run build

# معاينة البناء
npm run preview
# → http://localhost:4173

# فحص الكود
npm run lint
```

---

## 📦 أوامر مفيدة

```bash
# نشر مباشر
npm run deploy

# نشر تجريبي (بدون رفع فعلي)
npm run deploy:dry

# عرض logs الإنتاج
npx wrangler tail

# حذف Worker (خطر!)
npx wrangler delete
```

---

## 🔧 استكشاف الأخطاء

### المشكلة: Build fails
**الحل:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### المشكلة: 404 عند refresh صفحة
**الحل:** تأكد أن `_redirects` موجود في `dist/` وأن `wrangler.toml` يحتوي على:
```toml
[assets]
not_found_handling = "single-page-application"
```

### المشكلة: المتغيرات البيئية لا تعمل
**الحل:**
1. تأكد من إضافتها في Cloudflare Dashboard
2. أعد البناء محلياً: `npm run build`
3. أعد النشر: `npm run deploy`

### المشكلة: الصور لا تظهر
**الحل:** الصور تستخدم Unsplash CDN - تأكد من اتصال الإنترنت.

---

## 📊 هيكل النشر النهائي

```
GitHub (main branch)
    ↓
npm run build
    ↓
dist/
  ├── index.html
  ├── assets/ (JS, CSS)
  ├── _redirects (SPA routing)
  ├── _headers (caching & security)
  └── [public files]
    ↓
wrangler deploy
    ↓
Cloudflare Workers (Static Assets)
    ↓
https://omrantoys.store
```

---

## ✅ Checklist قبل النشر

- [ ] `npm run lint` → 0 أخطاء
- [ ] `npm run build` → ناجح
- [ ] `npx wrangler login` → مسجل الدخول
- [ ] الدومين `omrantoys.store` مربوط بـ Cloudflare
- [ ] Environment Variables مضافة (إن لزم)
- [ ] `npm run deploy` → نُشر بنجاح
- [ ] الموقع يفتح: `https://omrantoys.store`
- [ ] SPA routing يعمل (جرب `/products/123`)
- [ ] Console نظيف من الأخطاء

---

## 📞 الدعم

- **Cloudflare Docs**: https://developers.cloudflare.com/workers/
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/
- **Vite**: https://vitejs.dev/

---

**آخر تحديث**: 2026-09-01  
**الحالة**: ✅ جاهز للنشر
