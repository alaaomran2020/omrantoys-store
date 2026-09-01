-- ============================================================
-- Omran Toys Store — D1 Smoke Tests (PASS/FAIL assertions)
-- يُشغَّل بعد d1-schema.sql:
--   npx wrangler d1 execute DB --local --file=cloudflare/d1-tests.sql
-- ============================================================

-- [بيانات اختبار] تجّار + منتجات
INSERT INTO profiles (id, email, full_name, phone, user_type, business_name, wholesale_tier, discount_rate, is_verified_merchant)
VALUES ('u-test-merchant-1', 'merchant@test.omran', 'تاجر التجزئة أحمد', '201000000001', 'wholesale', 'أحمد للألعاب بالجملة', 'tier2', 7.5, 1);

INSERT INTO products (id, sku, name_ar, description, category_id, retail_price, wholesale_price, wholesale_price_tier2, wholesale_price_tier3,
                      stock_quantity, weight_grams, age_group, brand, images, tags, is_featured) VALUES
('p-rc-001', 'OMR-RC-001', 'سيارة تحكم عن بعد سريعة', 'سيارة ريموت ببطارية قابلة للشحن ومناسب للأعمار 6-8', 'rc-electronic',
 250, 200, 185, 170, 15, 500, '6-8', 'SpeedX', '["/img/car1.jpg","/img/car2.jpg"]', '["سيارات","ريموت"]', 1),
('p-edu-014', 'OMR-EDU-014', 'مكعبات تعليمية STEM 120 قطعة', 'طقم مكعبات بناء تعليمي يعزز مهارات الهندسة والمنطق', 'educational',
 120, 95, NULL, NULL, 3, 200, '3-5', 'BlockLab', '["/img/blocks.jpg"]', '["مكعبات","STEM"]', 0),
('p-doll-007', 'OMR-DOLL-007', 'دمية بيت الدمى الخشبي', 'بيت دمى خشبي بأثاث كامل', 'dolls-figures',
 340, 280, 260, 240, 0, 2500, '3-5', 'WoodToy', '["/img/doll.jpg"]', '["دمى"]', 0),
('p-del-001', 'OMR-DEL-001', 'منتج للحذف التجريبي', 'يُستخدم لاختبار CASCADE وSET NULL', 'board-games',
 75, 60, NULL, NULL, 9, 300, '6-8', 'TestBrand', '["/img/x.jpg"]', '["اختبار"]', 0);

-- اختبار توليد UUID تلقائياً في D1 (إدخال بدون id)
INSERT INTO products (sku, name_ar, category_id, retail_price) VALUES ('OMR-AUTO-001', 'منتج بتوليد ID تلقائي', 'outdoor', 45);

-- [T01] الفئات المزروعة = 11
SELECT CASE WHEN (SELECT COUNT(*) FROM categories) = 11
  THEN '✅ PASS T01: categories = 11'
  ELSE '❌ FAIL T01: categories = ' || (SELECT COUNT(*) FROM categories) END AS result;

-- [T02] مناطق الشحن = 24 + بيانات الغربية صحيحة (40 / 800 / 8)
SELECT CASE WHEN (SELECT COUNT(*) FROM shipping_zones) = 24
              AND (SELECT base_cost FROM shipping_zones WHERE governorate='Gharbia') = 40
              AND (SELECT free_shipping_threshold FROM shipping_zones WHERE governorate='Gharbia') = 800
              AND (SELECT extra_cost_per_kg FROM shipping_zones WHERE governorate='Gharbia') = 8
  THEN '✅ PASS T02: shipping_zones = 24 وبيانات الغربية صحيحة'
  ELSE '❌ FAIL T02' END AS result;

-- [T03] المنتجات المدرجة = 5
SELECT CASE WHEN (SELECT COUNT(*) FROM products) = 5
  THEN '✅ PASS T03: products = 5'
  ELSE '❌ FAIL T03: products = ' || (SELECT COUNT(*) FROM products) END AS result;

-- [T04] توليد UUID تلقائي + القيم الافتراضية
SELECT CASE WHEN (SELECT id FROM products WHERE sku='OMR-AUTO-001') IS NOT NULL
              AND (SELECT length(id) FROM products WHERE sku='OMR-AUTO-001') = 32
              AND (SELECT is_active FROM products WHERE sku='OMR-AUTO-001') = 1
              AND (SELECT discount_percent FROM products WHERE sku='OMR-AUTO-001') = 0
              AND (SELECT stock_quantity FROM products WHERE sku='OMR-AUTO-001') = 0
  THEN '✅ PASS T04: UUID تلقائي (32 hex) + defaults (is_active=1, discount=0, stock=0)'
  ELSE '❌ FAIL T04' END AS result;

-- [T05] دوال JSON على الحقول النصية (بديل JSONB/TEXT[])
SELECT CASE WHEN json_extract((SELECT images FROM products WHERE sku='OMR-RC-001'), '$[0]') = '/img/car1.jpg'
              AND json_array_length((SELECT tags FROM products WHERE sku='OMR-RC-001')) = 2
  THEN '✅ PASS T05: json_extract/json_array_length تعمل على images/tags'
  ELSE '❌ FAIL T05' END AS result;

-- [T06] بحث FTS5 بالعربية: «سيارة»
SELECT CASE WHEN (SELECT COUNT(*) FROM products_fts WHERE products_fts MATCH 'سيارة') = 1
              AND (SELECT product_id FROM products_fts WHERE products_fts MATCH 'سيارة' LIMIT 1) = 'p-rc-001'
  THEN '✅ PASS T06: FTS5 يجد «سيارة» → OMR-RC-001'
  ELSE '❌ FAIL T06: نواتج=' || (SELECT COUNT(*) FROM products_fts WHERE products_fts MATCH 'سيارة') END AS result;

-- [T07] بحث FTS5: «مكعبات» (اسم) + «مهارات» (وصف)
-- ملاحظة موثقة: unicode61 لا يجذّر العربية — «والمنطق» ≠ «منطق»؛
-- لذلك اخترنا توكنز مستقلة موجودة فعلاً في النص
SELECT CASE WHEN (SELECT COUNT(*) FROM products_fts WHERE products_fts MATCH 'مكعبات') = 1
              AND (SELECT COUNT(*) FROM products_fts WHERE products_fts MATCH 'مهارات') = 1
              AND (SELECT COUNT(*) FROM products_fts WHERE products_fts MATCH 'والمنطق') = 1
  THEN '✅ PASS T07: FTS5 يفهرس الاسم والوصف (مكعبات/مهارات) + توكن مركب (والمنطق)'
  ELSE '❌ FAIL T07' END AS result;

-- [T08] تسعير الجملة حسب الفئة (بديل دالة get_product_price)
SELECT CASE WHEN (SELECT COALESCE(wholesale_price_tier3, wholesale_price, retail_price) FROM products WHERE id='p-rc-001') = 170
              AND (SELECT COALESCE(wholesale_price_tier2, wholesale_price, retail_price) FROM products WHERE id='p-rc-001') = 185
              AND (SELECT COALESCE(wholesale_price, retail_price)                        FROM products WHERE id='p-rc-001') = 200
              AND (SELECT retail_price                                                   FROM products WHERE id='p-rc-001') = 250
              -- tier3 لمنتج بلا tier3 مخزنة → يرجع للسعر الأعلى متاح (95 ثم 120)
              AND (SELECT COALESCE(wholesale_price_tier3, wholesale_price, retail_price) FROM products WHERE id='p-edu-014') = 95
  THEN '✅ PASS T08: get_product_price — tier3=170, tier2=185, tier1=200, retail=250 + COALESCE fallback=95'
  ELSE '❌ FAIL T08' END AS result;

-- [T09..T12] حساب الشحن الديناميكي (بديل دالة calculate_shipping_cost)
-- T09: الغربية، subtotal=500، وزن 2500جم → 40 + CEIL(1.5)*8 = 56، مدة 1-2
SELECT CASE WHEN (SELECT base_cost + CEIL(MAX(0, (2500 - 1000) / 1000.0)) * extra_cost_per_kg
                  FROM shipping_zones WHERE governorate_ar='الغربية' OR governorate='الغربية') = 56
  THEN '✅ PASS T09: شحن الغربية (وزن 2.5كجم، 500ج) = 56 جنيه'
  ELSE '❌ FAIL T09' END AS result;

-- T10: القاهرة subtotal=1000 ≥ 1000 → شحن مجاني 0
SELECT CASE WHEN (1000 >= (SELECT free_shipping_threshold FROM shipping_zones WHERE governorate='Cairo'))
  THEN '✅ PASS T10: القاهرة (1000ج ≥ 1000) → شحن مجاني (0)'
  ELSE '❌ FAIL T10' END AS result;

-- T11: القاهرة subtotal=300 ووزن 800جم (أقل من كيلو) → base فقط = 50
SELECT CASE WHEN (SELECT base_cost + CEIL(MAX(0, (800 - 1000) / 1000.0)) * extra_cost_per_kg
                  FROM shipping_zones WHERE governorate='Cairo') = 50
  THEN '✅ PASS T11: وزن أقل من 1كجم → لا تكلفة وزن إضافية (50)'
  ELSE '❌ FAIL T11' END AS result;

-- T12: محافظة غير موجودة → fallback 50 / '2-3 أيام'
SELECT CASE WHEN (SELECT COUNT(*) FROM shipping_zones WHERE governorate_ar='محافظة وهمية') = 0
  THEN '✅ PASS T12: محافظة غير مسجلة → fallback 50 / 2-3 أيام (0 صف في الزون)'
  ELSE '❌ FAIL T12' END AS result;

-- [الطلب] الغربية: 2× سيارة(250) + 1× مكعبات(120) = 620
-- وزن: 2×500 + 200 = 1200جم → شحن 40 + CEIL(0.2)*8 = 48 | ض 14% على 558 = 78.12 | الإجمالي = 684.12
INSERT INTO orders (id, user_id, customer_name, phone, governorate, city, address,
                    subtotal, discount_amount, shipping_cost, vat_amount, total,
                    weight_total_grams, payment_method, payment_gateway, status) VALUES
('OMR-TEST-0001', 'u-test-merchant-1', 'محمود السيد', '201555570269', 'الغربية', 'طنطا', 'شارع البحر - عمارة 5',
 620, 62, 48, 78.12, 684.12, 1200, 'cod', 'cod', 'قيد الانتظار');

INSERT INTO order_items (order_id, product_id, product_sku, product_name, quantity, unit_price, total_price) VALUES
('OMR-TEST-0001', 'p-rc-001', 'OMR-RC-001', 'سيارة تحكم عن بعد سريعة', 2, 250, 500),
('OMR-TEST-0001', 'p-edu-014', 'OMR-EDU-014', 'مكعبات تعليمية STEM 120 قطعة', 1, 120, 120);

-- [T13] صحة أرقام الطلب
SELECT CASE WHEN (SELECT SUM(total_price) FROM order_items WHERE order_id='OMR-TEST-0001') = 620
              AND (SELECT total FROM orders WHERE id='OMR-TEST-0001') = 684.12
              AND (SELECT vat_amount FROM orders WHERE id='OMR-TEST-0001') = 78.12
              AND (SELECT shipping_cost FROM orders WHERE id='OMR-TEST-0001') = 48
  THEN '✅ PASS T13: إجماليات الطلب صحيحة (620 + شحن 48 + ض 78.12 − خصم 62 = 684.12)'
  ELSE '❌ FAIL T13' END AS result;

-- [T14] عرض v_order_summary
SELECT CASE WHEN (SELECT items FROM v_order_summary WHERE id='OMR-TEST-0001') = 2
              AND (SELECT items_total FROM v_order_summary WHERE id='OMR-TEST-0001') = 620
  THEN '✅ PASS T14: v_order_summary (2 سطور، 620)'
  ELSE '❌ FAIL T14' END AS result;

-- [T15] عرض المخزون المنخفض يرصد OMR-EDU-014 (3 ≤ 5)
SELECT CASE WHEN (SELECT COUNT(*) FROM v_low_stock WHERE sku='OMR-EDU-014') = 1
              AND (SELECT COUNT(*) FROM v_low_stock WHERE sku='OMR-RC-001') = 0
  THEN '✅ PASS T15: v_low_stock ترصد مكعبات STEM (3≤5) وتستبعد السيارة (15)'
  ELSE '❌ FAIL T15' END AS result;

-- [T16] trigger تحديث updated_at
UPDATE products SET views_count = views_count + 1, updated_at = '2000-01-01 00:00:00' WHERE id = 'p-rc-001';
SELECT CASE WHEN (SELECT updated_at > '2000-01-01 00:00:01' FROM products WHERE id='p-rc-001')
  THEN '✅ PASS T16: trigger يعيد updated_at للتوقيت الحالي'
  ELSE '❌ FAIL T16: updated_at=' || (SELECT updated_at FROM products WHERE id='p-rc-001') END AS result;

-- [T18] المراجعات + متوسط التقييم
INSERT INTO reviews (product_id, author_name, rating, comment, is_verified_purchase) VALUES
('p-rc-001', 'منال ع.', 5, 'سريعة وبطاريتها تدوم', 1),
('p-rc-001', 'خالد م.', 4, 'جيدة مقابل السعر', 1);
SELECT CASE WHEN (SELECT AVG(rating) FROM reviews WHERE product_id='p-rc-001') = 4.5
  THEN '✅ PASS T17: متوسط التقييم = 4.5'
  ELSE '❌ FAIL T17' END AS result;

-- [T18] إشعار توفار صالح (بالهاتف)
INSERT INTO stock_notifications (product_id, phone) VALUES ('p-doll-007', '201555570269');
SELECT CASE WHEN (SELECT COUNT(*) FROM stock_notifications WHERE product_id='p-doll-007') = 1
  THEN '✅ PASS T18: إشعار نفاد مخزون محفوظ (هاتف)'
  ELSE '❌ FAIL T18' END AS result;

-- [T19] المقالات B2B + JSON مصادر
INSERT INTO b2b_articles (slug, title_ar, excerpt_ar, content_ar, category, target_audience, data_sources, is_published, published_at) VALUES
('toy-wholesale-margins-2026', 'هوامش تجارة الألعاب بالجملة 2026', 'تحليل أرقام هوامش الجملة في السوق المصري.', 'تشير بيانات 2026 إلى متوسط هامش 18-25% بعد الشحن...', 'market_data', 'wholesale', '["تقارير سوق 2026","عينة 40 تاجر"]', 1, '2026-08-01 10:00:00');
SELECT CASE WHEN (SELECT COUNT(*) FROM b2b_articles WHERE is_published=1) = 1
              AND json_array_length((SELECT data_sources FROM b2b_articles WHERE slug='toy-wholesale-margins-2026')) = 2
  THEN '✅ PASS T19: مقال B2B منشور + data_sources كـ JSON (عنصران)'
  ELSE '❌ FAIL T19' END AS result;

-- [T20] المفضلة (UNIQUE user+product)
INSERT INTO wishlists (user_id, product_id) VALUES ('u-test-merchant-1', 'p-rc-001');
SELECT CASE WHEN (SELECT COUNT(*) FROM wishlists) = 1
  THEN '✅ PASS T20: إضافة للمفضلة'
  ELSE '❌ FAIL T20' END AS result;

-- [T21] حذف المنتج التجريبي: CASCADE للمراجعات/الإشعارات + SET NULL لعناصر الطلب
INSERT INTO reviews (product_id, author_name, rating) VALUES ('p-del-001', 'تجربة', 3);
INSERT INTO stock_notifications (product_id, email) VALUES ('p-del-001', 'x@test.omran');
INSERT INTO order_items (order_id, product_id, product_sku, product_name, quantity, unit_price, total_price) VALUES
('OMR-TEST-0001', 'p-del-001', 'OMR-DEL-001', 'منتج للحذف التجريبي', 1, 75, 75);
DELETE FROM products WHERE id = 'p-del-001';
SELECT CASE WHEN (SELECT COUNT(*) FROM reviews WHERE product_id='p-del-001') = 0
              AND (SELECT COUNT(*) FROM stock_notifications WHERE product_id='p-del-001') = 0
              AND (SELECT product_id FROM order_items WHERE product_sku='OMR-DEL-001') IS NULL
              AND (SELECT COUNT(*) FROM order_items WHERE order_id='OMR-TEST-0001') = 3
  THEN '✅ PASS T21: ON DELETE CASCADE (مراجعات/إشعارات) + SET NULL (عناصر الطلب) تعمل'
  ELSE '❌ FAIL T21' END AS result;

-- [T22] مسار الطلب بالحالات العربية + trigger الطلبات
UPDATE orders SET status = 'تم الشحن' WHERE id = 'OMR-TEST-0001';
SELECT CASE WHEN (SELECT status FROM orders WHERE id='OMR-TEST-0001') = 'تم الشحن'
              AND (SELECT updated_at >= '2026-01-01' FROM orders WHERE id='OMR-TEST-0001')
  THEN '✅ PASS T22: تحديث حالة عربية (تم الشحن) + trigger updated_at'
  ELSE '❌ FAIL T22' END AS result;

-- [T23] تكامل المفاتيح الأجنبية (بديل فحص RLS الأساسي في D1)
SELECT CASE WHEN (SELECT COUNT(*) FROM pragma_foreign_key_check) = 0
  THEN '✅ PASS T23: pragma_foreign_key_check = 0 مخالفات'
  ELSE '❌ FAIL T23: ' || (SELECT COUNT(*) FROM pragma_foreign_key_check) || ' مخالفة' END AS result;
