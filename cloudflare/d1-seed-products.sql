-- بيانات تجريبية: تُولَّد من src/data/products.js (لا تُستخدم في الإنتاج)
INSERT OR IGNORE INTO products (id, sku, name_ar, name_en, description, category_id,
       retail_price, original_price, discount_percent, stock_quantity, images, features, tags,
       age_group, brand, is_active, is_best_seller, is_new)
     VALUES (
       '1001', 'OMR-IG-KIT-46', 'مطبخ ألعاب للأطفال — 46 قطعة', 'Kids Kitchen Play Set — 46 Pieces', 'مطبخ أطفال كامل بأدوات وأواني وإكسسوارات كتير للعب التخيلي، مناسب للبنات والأولاد.',
       'dolls-figures', 850, NULL, 0,
       12, '["/imported/omran-product-01.png"]', '["46 قطعة متنوعة","أدوات وأواني للعب التخيلي","ألوان جذابة وتصميم لطيف","مناسب من عمر 3 سنوات"]', '["مطبخ","لعب تمثيلي","هدايا","أطفال"]', '3-5',
       'Omran Toys', 1, 0, 1
     );
INSERT OR IGNORE INTO products (id, sku, name_ar, name_en, description, category_id,
       retail_price, original_price, discount_percent, stock_quantity, images, features, tags,
       age_group, brand, is_active, is_best_seller, is_new)
     VALUES (
       '1002', 'OMR-IG-SQ-01', 'لعبة الاسكوشي بأشكال وألوان متنوعة', 'Squishy Stress Relief Toy', 'لعبة ناعمة ولطيفة للتسلية وتفريغ الطاقة، تنفع كهدية حلوة للأطفال والكبار.',
       'arts-crafts', 275, NULL, 0,
       30, '["/imported/omran-product-02.png"]', '["خامة ناعمة","أشكال وألوان متنوعة","سهلة الحمل والتسلية","مناسبة للهدايا"]', '["اسكوشي","تسلية","هدايا","ألوان"]', '3-5',
       'Omran Toys', 1, 0, 1
     );
INSERT OR IGNORE INTO products (id, sku, name_ar, name_en, description, category_id,
       retail_price, original_price, discount_percent, stock_quantity, images, features, tags,
       age_group, brand, is_active, is_best_seller, is_new)
     VALUES (
       '1003', 'OMR-IG-HC-104', 'مطبخ Home Chef للأطفال — 104 قطعة', 'Home Chef Kids Kitchen — 104 Pieces', 'مطبخ لعب واقعي جدًا بإضاءة وأصوات وملحقات كتير، مناسب للأطفال من 3 سنين.',
       'dolls-figures', 1850, NULL, 0,
       8, '["/imported/omran-product-03.png"]', '["104 قطعة وإكسسوار","إضاءة وأصوات تفاعلية","تصميم لعب واقعي","مناسب من عمر 3 سنوات"]', '["مطبخ","لعب تمثيلي","إضاءة","هدايا"]', '3-5',
       'Omran Toys', 1, 0, 1
     );
