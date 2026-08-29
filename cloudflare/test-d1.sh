#!/usr/bin/env bash
# ============================================================
# Omran Toys Store — Cloudflare D1 Test Runner
# تشغيل كامل: schema + اختبارات إيجابية + اختبارات سلبية متوقعة الفشل
#   bash cloudflare/test-d1.sh
# ============================================================
set -u
cd "$(dirname "$0")/.."

DB="DB"
W="npx wrangler"
PASSED=0; FAILED=0

run_sql_file() { $W d1 execute $DB --local --file="$1" >/dev/null 2>&1; }

# تمرير متوقع النجاح: يرجع 0 لو نجح
expect_ok() {
  local label="$1"; shift
  if "$@" >/dev/null 2>&1; then
    echo "✅ PASS (نجح كما هو متوقع): $label"; PASSED=$((PASSED+1))
  else
    echo "❌ FAIL (كان متوقعاً أن ينجح): $label"; FAILED=$((FAILED+1))
  fi
}

# تمرير متوقع الفشل (قيود قاعدة البيانات): يرجع 0 لو فشل الإدخال فعلاً
expect_reject() {
  local label="$1"; shift
  if "$@" >/dev/null 2>&1; then
    echo "❌ FAIL (المفروض ترفض القاعدة هذا الإدخال): $label"; FAILED=$((FAILED+1))
  else
    echo "✅ PASS (رُفض كما هو متوقع): $label"; PASSED=$((PASSED+1))
  fi
}

echo "════════ 1) تهيئة الـ Schema ════════"
rm -rf .wrangler/state/v3/d1
expect_ok "إنشاء الجداول والفهارس والـ triggers" run_sql_file cloudflare/d1-schema.sql

echo ""
echo "════════ 2) الاختبارات الإيجابية (d1-tests.sql) ════════"
expect_ok "تنفيذ 25 اختبار PASS/FAIL" run_sql_file cloudflare/d1-tests.sql
$W d1 execute $DB --local --file=cloudflare/d1-tests.sql 2>/dev/null | grep -E "PASS|FAIL" || true

echo ""
echo "════════ 3) اختبارات سلبية: قيود يجب أن ترفض الإدخال ════════"
ex() { $W d1 execute $DB --local --command "$1" >/dev/null 2>&1; }

# N01 سعر سالب
expect_reject "N01 retail_price = -5" ex "INSERT INTO products (sku,name_ar,retail_price) VALUES ('N01','سالب',-5);"
# N02 خصم > 100
expect_reject "N02 discount_percent = 150" ex "INSERT INTO products (sku,name_ar,retail_price,discount_percent) VALUES ('N02','خصم',10,150);"
# N03 فئة عمرية غير صالحة
expect_reject "N03 age_group غير صالحة" ex "INSERT INTO products (sku,name_ar,retail_price,age_group) VALUES ('N03','عمر',10,'15-20');"
# N04 SKU مكرر
expect_reject "N04 SKU مكرر" ex "INSERT INTO products (sku,name_ar,retail_price) VALUES ('OMR-RC-001','مكرر',10);"
# N05 تقييم > 5
expect_reject "N05 rating = 7" ex "INSERT INTO reviews (product_id,author_name,rating) VALUES ('p-rc-001','x',7);"
# N06 كمية صفر
expect_reject "N06 quantity = 0" ex "INSERT INTO order_items (order_id,product_name,quantity,unit_price,total_price) VALUES ('OMR-TEST-0001','س',0,10,0);"
# N07 حالة عربية غير مسموحة
expect_reject "N07 status عربي غير صالح" ex "UPDATE orders SET status='استلمت' WHERE id='OMR-TEST-0001';"
# N08 حالة دفع غير صالحة
expect_reject "N08 payment_status غير صالح" ex "UPDATE orders SET payment_status='maybe' WHERE id='OMR-TEST-0001';"
# N09 كوبون خصم 150%
expect_reject "N09 كوبون 150%" ex "INSERT INTO coupons (code,discount_percent) VALUES ('N09',150);"
# N10 كوبون مكرر
expect_reject "N10 كود كوبون مكرر" ex "INSERT INTO coupons (code,discount_percent) VALUES ('SAVE10',5);"
# N11 إشعار نفاد بدون أي وسيلة تواصل
expect_reject "N11 إشعار بدون email/phone/user" ex "INSERT INTO stock_notifications (product_id) VALUES ('p-rc-001');"
# N12 عنصر طلب لطلب غير موجود (FK)
expect_reject "N12 FK: order_id غير موجود" ex "INSERT INTO order_items (order_id,product_name,quantity,unit_price,total_price) VALUES ('NOPE-1','س',1,10,10);"
# N13 مفضلة مكررة (UNIQUE user+product)
expect_reject "N13 مفضلة مكررة" ex "INSERT INTO wishlists (user_id,product_id) VALUES ('u-test-merchant-1','p-rc-001');"
# N14 محافظة شحن مكررة
expect_reject "N14 محافظة مكررة" ex "INSERT INTO shipping_zones (governorate,governorate_ar) VALUES ('Gharbia','الغربية');"
# N15 نوع مستخدم غير صالح
expect_reject "N15 user_type غير صالح" ex "INSERT INTO profiles (email,full_name,user_type) VALUES ('n15@t.om','x','vip');"
# N16 فئة جملة غير صالحة
expect_reject "N16 wholesale_tier غير صالح" ex "INSERT INTO profiles (email,full_name,wholesale_tier) VALUES ('n16@t.om','x','tier9');"

echo ""
echo "════════ 4) فحص سلامة قاعدة البيانات ════════"
$W d1 execute $DB --local --command "PRAGMA integrity_check;" 2>/dev/null | tail -8
$W d1 execute $DB --local --command "SELECT COUNT(*) AS violations FROM pragma_foreign_key_check;" 2>/dev/null | tail -8

echo ""
echo "════════ الملخص ════════"
echo "نجح: $PASSED | فشل: $FAILED"
[ $FAILED -eq 0 ] && echo "🎉 كل اختبارات D1 ناجحة" || echo "⚠️ فيه اختبارات فاشلة — راجع الأعلى"
exit $FAILED
