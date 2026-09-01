# 📋 تقرير اختبار قاعدة بيانات Cloudflare D1

**المستودع:** `alaaomran2020/omrantoys-store` — **التاريخ:** 2026-08-29 (تحديث 2026-09-01)
**الأداة:** wrangler 4.127.1 — وضع `--local` (محاكاة D1 الرسمية عبر workerd بنفس محرك SQLite المستخدم في الإنتاج)

---

## ✅ النتيجة النهائية

| المجموعة | النتيجة |
|---|---|
| بناء الـ Schema (12 كائن: 11 جدول + FTS5 + 3 Views + 7 Triggers + 7 Indexes) | ✅ نجح |
| اختبارات إيجابية (T01–T25) | ✅ **25 / 25** |
| اختبارات سلبية — قيود ترفض بيانات فاسدة (N01–N16) | ✅ **16 / 16** |
| `pragma_foreign_key_check` | ✅ 0 مخالفات |
| سكريبت التشغيل الشامل `test-d1.sh` | ✅ 18 / 18 |

**الخلاصة: الـ schema متوافق بالكامل مع D1 وجاهز للنشر الفعلي.**

---

## 📊 عدادات الجداول بعد التشغيل

| الجدول | الصفوف | | الجدول | الصفوف |
|---|---|---|---|---|
| profiles | 1 | | coupons | 6 (4 فعليّة للمتجر + 2 اختبار) |
| categories | 11 (بذر كامل) | | wishlists | 1 |
| products | 4 | | reviews | 2 |
| orders | 1 | | stock_notifications | 1 |
| order_items | 3 | | products_fts | 4 (متزامن) |
| shipping_zones | 24 (كل المحافظات) | | b2b_articles | 1 |

---

## 🧪 أبرز ما تم التحقق منه

| الاختبار | التفاصيل |
|---|---|
| **T04** توليد UUID | `DEFAULT (lower(hex(randomblob(16))))` يعمل في D1 |
| **T05** دوال JSON | `json_extract` / `json_array_length` على حقول images/tags (بديل JSONB) |
| **T06–T07** بحث عربي FTS5 | «سيارة» و«مكعبات» و«والمنطق» تُفهرس وتُبحث |
| **T08** تسعير الجملة | tier3=170 / tier2=185 / tier1=200 / retail=250 مع COALESCE fallback |
| **T09–T12** الشحن الديناميكي | الغربية 2.5كجم/500ج = **56ج** • القاهرة 1000ج = **مجاني** • وزن<كجم = base فقط • محافظة غياب = fallback 50 |
| **T14** محاسبة الطلب | 620 + شحن 48 + ضريبة 78.12 − خصم 62 = **684.12** ✓ |
| **T16** مخزون منخفض | `v_low_stock` ترصد (3≤5) وتستبعد (15) |
| **T17/T24** Triggers | `updated_at` يتحدث تلقائياً للطلبات والمنتجات |
| **T23** CASCADE / SET NULL | حذف المنتج يحذف مراجعاته وإشعاراته ويبطّط `product_id` في عناصر الطلب |
| **N01–N16** القيود | رفض: سعر سالب، خصم>100، تقييم>5، كمية 0، SKU مكرر، حالات عربية غير صالحة، كوبونات فاسدة، FK غائب، مفضلة مكررة، محافظة مكررة، أنواع غير صالحة |

---

## ⚠️ اكتشافات مهمة (ملاحظات إنتاجية)

1. **FTS5 بدون تجذير عربي (stemming):** الـ tokenizer `unicode61` يقسّم الكلمات حرفياً — البحث عن «منطق» لا يطابق «والمنطق». *التوصية:* بحث العملاء النهائيين يمزج `MATCH` مع `LIKE '%…%'` احتياطياً، أو إزالة أدوات التعريف (ال، و) وقت الفهرسة.
2. **`PRAGMA integrity_check` ممنوع في D1:** رجّع `SQLITE_AUTH` — الـ PRAGMA في D1 مسموح بقائمة بيضاء فقط. البديل المختبر: `SELECT COUNT(*) FROM pragma_foreign_key_check` = 0 ✓
3. **RLS غير موجود في D1:** سياسات Supabase الـ 15 لا تُترجم — يجب فرض الصلاحيات داخل كود الـ Worker/التطبيق (من قائمة المهام عند الترحيل الفعلي).
4. **البحث النصي الجابي:** ترجمة `GIN/to_tsvector('arabic')` إلى FTS5 نجحت، لكن مستوى التحليل المورفولوجي أقل من Postgres.

---

## 🗺️ خريطة الترحيل Supabase → D1

| Postgres/Supabase | D1/SQLite (المُطبَّق) |
|---|---|
| `UUID DEFAULT uuid_generate_v4()` | `TEXT DEFAULT (lower(hex(randomblob(16))))` |
| `TIMESTAMPTZ DEFAULT NOW()` | `TEXT DEFAULT CURRENT_TIMESTAMP` |
| `JSONB` / `TEXT[]` | `TEXT` + دوال `json_*` |
| `GIN (to_tsvector('arabic'))` | FTS5 + triggers مزامنة |
| RLS Policies | ❌ تُنفَّذ في كود التطبيق/Worker |
| plpgsql functions | استعلامات CASE / Views |
| Trigger `update_updated_at` | AFTER UPDATE trigger (بدون recursion) |

---

## 🔧 إصلاح لاحق (2026-09-01): بذر الكوبونات الفعلية في الـ Schema

**المشكلة:** كان `cloudflare/d1-schema.sql` (الملف المستقل المُستخدم في الاختبار والنشر) يبذر الفئات فقط، بينما كوبونات المتجر الفعلية (`OMRAN10`, `TOYS20`, `EID2026`, `FREESHIP`) كانت موجودة حصرياً في `migrations/0002_seed_coupons.sql` و`src/data/coupons.js`. لذلك قاعدة جديدة تُنشأ عبر `d1-schema.sql` لم تكن تحتوي `OMRAN10`، وكانت نقطة `/api/coupons/validate` ترفض كوبون الترحيب.

**الحل:** أُضيف قسم `SEED: الكوبونات` إلى `d1-schema.sql` مطابقاً للمصدرين أعلاه، مع `max_uses = NULL` (غير محدود) — مهم لأن شرط الـ Worker `(max_uses IS NULL OR used_count < max_uses)` يجعل `0` يرفض الكوبون دائماً.

**التحقق:** ✅ أُعيد تشغيل 18/18 اختباراً دون كسر، وتأكد فعلياً عبر `wrangler dev`:
- `POST /api/coupons/validate {code:OMRAN10, subtotal:500}` → `valid:true, discount:50`
- `TOYS20` بأقل من الحد الأدنى → رفض بالرسالة الصحيحة
- دورة طلب كاملة `POST /api/orders` + `GET /api/orders/:id` تعمل مع D1

---

## 🚀 التشغيل والنشر الفعلي

```bash
# اختبار محلي كامل (لا يحتاج حساب)
npm run db:d1:test

# النشر على D1 الحقيقي (يتطلب حسابك على Cloudflare)
npx wrangler login
npx wrangler d1 create omran-toys-db        # ← انسخ database_id إلى wrangler.toml
npx wrangler d1 execute DB --remote --file=cloudflare/d1-schema.sql
npx wrangler d1 execute DB --remote --file=cloudflare/d1-tests.sql
```

**الملفات:** `cloudflare/d1-schema.sql` • `cloudflare/d1-tests.sql` • `cloudflare/test-d1.sh` • `wrangler.toml`
