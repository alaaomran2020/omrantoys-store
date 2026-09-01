-- ============================================================
-- Migration 0001: المخطط الأولي — مأخوذ من cloudflare/d1-schema.sql
-- تُطبق عبر: wrangler d1 migrations apply DB [--local|--remote]
-- ============================================================

-- ============================================================
-- Omran Toys Store — Cloudflare D1 (SQLite) Schema
-- ترجمة منه: supabase/schema.sql (Postgres) إلى لهجة SQLite/D1
-- فروقات مقصودة عن نسخة Supabase:
--   UUID            → TEXT مع DEFAULT (lower(hex(randomblob(16))))
--   TIMESTAMPTZ     → TEXT + DEFAULT CURRENT_TIMESTAMP
--   JSONB / TEXT[]  → TEXT (تخزين JSON نصي + دوال json_extract)
--   GIN/FTS العربي  → FTS5 (tokenizer: unicode61)
--   RLS Policies    → غير متاحة في D1 (تُفرض على مستوى الـ Worker/التطبيق)
--   plpgsql funcs   → تُستبدل بعرضات/استعلامات CASE (انظر d1-tests.sql)
-- ============================================================

-- تنظيف لإعادة التشغيل (الأبناء قبل الآباء)

-- ============================================
-- 1. USERS / MERCHANTS (Profiles)
-- ============================================
CREATE TABLE profiles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  user_type TEXT NOT NULL DEFAULT 'retail' CHECK (user_type IN ('retail', 'wholesale')),
  -- حقول B2B
  business_name TEXT,
  tax_id TEXT,
  commercial_register TEXT,
  governorate TEXT,
  city TEXT,
  address TEXT,
  is_verified_merchant INTEGER DEFAULT 0 CHECK (is_verified_merchant IN (0, 1)),
  wholesale_tier TEXT DEFAULT 'tier1' CHECK (wholesale_tier IN ('tier1', 'tier2', 'tier3')),
  discount_rate REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. CATEGORIES
-- ============================================
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  icon TEXT,
  color_gradient TEXT,
  parent_id TEXT REFERENCES categories(id),
  is_active INTEGER DEFAULT 1 CHECK (is_active IN (0, 1)),
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. PRODUCTS / INVENTORY
-- ============================================
CREATE TABLE products (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  sku TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  slug TEXT UNIQUE,
  description TEXT,
  category_id TEXT REFERENCES categories(id),

  -- التسعير B2B & B2C
  retail_price REAL NOT NULL CHECK (retail_price >= 0),
  wholesale_price REAL CHECK (wholesale_price >= 0),
  wholesale_price_tier2 REAL,
  wholesale_price_tier3 REAL,
  original_price REAL,
  discount_percent INTEGER DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100),
  cost_price REAL,

  -- المخزون
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INTEGER DEFAULT 5,
  weight_grams INTEGER DEFAULT 500,
  dimensions_cm TEXT,
  is_active INTEGER DEFAULT 1 CHECK (is_active IN (0, 1)),
  is_visible INTEGER DEFAULT 1 CHECK (is_visible IN (0, 1)),

  -- خصائص البحث المُوجّه (Faceted Search)
  age_group TEXT CHECK (age_group IN ('0-2', '3-5', '6-8', '9-12', '12+')),
  brand TEXT,
  toy_type TEXT,
  material TEXT,
  battery_required TEXT,

  -- أعلام
  is_new INTEGER DEFAULT 0 CHECK (is_new IN (0, 1)),
  is_best_seller INTEGER DEFAULT 0 CHECK (is_best_seller IN (0, 1)),
  is_featured INTEGER DEFAULT 0 CHECK (is_featured IN (0, 1)),
  is_balloon INTEGER DEFAULT 0 CHECK (is_balloon IN (0, 1)),
  is_party_supply INTEGER DEFAULT 0 CHECK (is_party_supply IN (0, 1)),

  -- الوسائط (JSON نصي)
  images TEXT DEFAULT '[]',
  video_url TEXT,

  -- SEO (tags/features بصيغة JSON نصية)
  tags TEXT DEFAULT '[]',
  features TEXT DEFAULT '[]',
  safety_notice TEXT,

  -- تحليلات
  views_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  rating REAL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  reviews_count INTEGER DEFAULT 0,

  -- الاستيراد الجماعي
  import_batch_id TEXT,
  import_source TEXT,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category    ON products(category_id);
CREATE INDEX idx_products_age_group   ON products(age_group);
CREATE INDEX idx_products_brand       ON products(brand);
CREATE INDEX idx_products_stock       ON products(stock_quantity);
CREATE INDEX idx_products_retail      ON products(retail_price);
CREATE INDEX idx_products_is_active   ON products(is_active);
CREATE INDEX idx_products_slug        ON products(slug);

-- بدائل GIN العربي: بحث نصي كامل عبر FTS5
CREATE VIRTUAL TABLE products_fts USING fts5(
  name_ar,
  description,
  product_id UNINDEXED,
  tokenize='unicode61'
);

-- ============================================
-- 4. STOCK NOTIFICATIONS
-- ============================================
CREATE TABLE stock_notifications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  is_notified INTEGER DEFAULT 0 CHECK (is_notified IN (0, 1)),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL OR user_id IS NOT NULL)
);

-- ============================================
-- 5. ORDERS
-- ============================================
CREATE TABLE orders (
  id TEXT PRIMARY KEY, -- بصيغة OMR-XXXX
  user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  governorate TEXT NOT NULL,
  city TEXT,
  address TEXT NOT NULL,

  subtotal REAL NOT NULL,
  discount_amount REAL DEFAULT 0,
  shipping_cost REAL DEFAULT 0,
  vat_amount REAL DEFAULT 0,
  total REAL NOT NULL,
  currency TEXT DEFAULT 'EGP',

  user_type TEXT DEFAULT 'retail',
  wholesale_discount_applied REAL DEFAULT 0,

  shipping_method TEXT DEFAULT 'standard',
  weight_total_grams INTEGER,
  estimated_delivery_days INTEGER DEFAULT 2,

  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_gateway TEXT, -- paymob, fawry, cod
  payment_transaction_id TEXT,

  status TEXT DEFAULT 'قيد الانتظار' CHECK (status IN ('قيد الانتظار', 'قيد التجهيز', 'تم الشحن', 'تم التوصيل', 'ملغي', 'مرتجع')),

  notes TEXT,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id    ON orders(user_id);
CREATE INDEX idx_orders_status     ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- 6. ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_sku TEXT,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price REAL NOT NULL,
  wholesale_price_applied REAL,
  total_price REAL NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. SHIPPING ZONES (24 محافظة مصرية)
-- ============================================
CREATE TABLE shipping_zones (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  governorate TEXT NOT NULL UNIQUE,
  governorate_ar TEXT NOT NULL,
  base_cost REAL NOT NULL DEFAULT 50,
  free_shipping_threshold REAL DEFAULT 1000,
  extra_cost_per_kg REAL DEFAULT 10,
  estimated_days_min INTEGER DEFAULT 1,
  estimated_days_max INTEGER DEFAULT 3,
  is_active INTEGER DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO shipping_zones (governorate, governorate_ar, base_cost, free_shipping_threshold, extra_cost_per_kg, estimated_days_min, estimated_days_max) VALUES
('Cairo', 'القاهرة', 50, 1000, 10, 1, 2),
('Giza', 'الجيزة', 50, 1000, 10, 1, 2),
('Alexandria', 'الإسكندرية', 60, 1000, 12, 1, 2),
('Gharbia', 'الغربية', 40, 800, 8, 1, 2),
('Dakahlia', 'الدقهلية', 50, 900, 10, 1, 3),
('Sharqia', 'الشرقية', 55, 900, 10, 1, 3),
('Qalyubia', 'القليوبية', 50, 900, 10, 1, 2),
('Beheira', 'البحيرة', 60, 1000, 12, 2, 3),
('Kafr El Sheikh', 'كفر الشيخ', 55, 900, 10, 2, 3),
('Damietta', 'دمياط', 60, 1000, 12, 2, 3),
('Port Said', 'بورسعيد', 65, 1000, 12, 2, 3),
('Ismailia', 'الإسماعيلية', 65, 1000, 12, 2, 3),
('Suez', 'السويس', 65, 1000, 12, 2, 3),
('Fayoum', 'الفيوم', 60, 1000, 12, 2, 3),
('Beni Suef', 'بني سويف', 60, 1000, 12, 2, 3),
('Minya', 'المنيا', 70, 1100, 15, 2, 4),
('Assiut', 'أسيوط', 75, 1100, 15, 2, 4),
('Sohag', 'سوهاج', 80, 1200, 15, 3, 4),
('Qena', 'قنا', 85, 1200, 18, 3, 5),
('Luxor', 'الأقصر', 85, 1200, 18, 3, 5),
('Aswan', 'أسوان', 90, 1300, 20, 3, 5),
('Red Sea', 'البحر الأحمر', 90, 1300, 20, 3, 5),
('South Sinai', 'جنوب سيناء', 95, 1300, 20, 3, 6),
('Matrouh', 'مطروح', 80, 1200, 15, 2, 4);

-- ============================================
-- 8. WISHLISTS
-- ============================================
CREATE TABLE wishlists (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- ============================================
-- 10. REVIEWS
-- ============================================
CREATE TABLE reviews (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_verified_purchase INTEGER DEFAULT 0 CHECK (is_verified_purchase IN (0, 1)),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TRIGGERS (بديل دوال plpgsql)
-- ============================================
-- تحديث updated_at تلقائياً (recursive_triggers=OFF افتراضياً → لا تكرار)
CREATE TRIGGER trg_profiles_updated_at AFTER UPDATE ON profiles FOR EACH ROW
BEGIN
  UPDATE profiles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER trg_products_updated_at AFTER UPDATE ON products FOR EACH ROW
BEGIN
  UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER trg_orders_updated_at AFTER UPDATE ON orders FOR EACH ROW
BEGIN
  UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- مزامنة فهرس البحث FTS5
CREATE TRIGGER trg_products_fts_ai AFTER INSERT ON products FOR EACH ROW
BEGIN
  INSERT INTO products_fts (product_id, name_ar, description)
  VALUES (NEW.id, NEW.name_ar, COALESCE(NEW.description, ''));
END;

CREATE TRIGGER trg_products_fts_au AFTER UPDATE ON products FOR EACH ROW
BEGIN
  DELETE FROM products_fts WHERE product_id = OLD.id;
  INSERT INTO products_fts (product_id, name_ar, description)
  VALUES (NEW.id, NEW.name_ar, COALESCE(NEW.description, ''));
END;

CREATE TRIGGER trg_products_fts_ad AFTER DELETE ON products FOR EACH ROW
BEGIN
  DELETE FROM products_fts WHERE product_id = OLD.id;
END;

-- ============================================
-- VIEWS (بدائل عمليات القراءة الجاهزة)
-- ============================================
CREATE VIEW v_low_stock AS
SELECT id, sku, name_ar, stock_quantity, low_stock_threshold
FROM products
WHERE is_active = 1 AND stock_quantity <= low_stock_threshold;

CREATE VIEW v_order_summary AS
SELECT o.id, o.customer_name, o.status, o.total,
       COUNT(oi.id) AS items,
       COALESCE(SUM(oi.total_price), 0) AS items_total
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id;

CREATE VIEW v_catalog AS
SELECT p.*, c.name_ar AS category_name_ar
FROM products p
LEFT JOIN categories c ON c.id = p.category_id;

-- ============================================
-- 11. CUSTOMER LEADS (تسجيل بيانات العملاء)
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  facebook TEXT,
  source TEXT DEFAULT 'website-signup',
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_phone      ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- ============================================
-- SEED: Categories
-- ============================================
INSERT INTO categories (id, name_ar, name_en, icon, color_gradient) VALUES
('all', 'كل الألعاب', 'All Toys', 'Sparkles', 'from-amber-400 to-orange-500'),
('educational', 'تعليمية وذكاء STEM', 'Educational', 'Brain', 'from-blue-500 to-indigo-600'),
('building', 'مكعبات وبناء', 'Building', 'Boxes', 'from-emerald-400 to-teal-600'),
('rc-electronic', 'تحكم عن بعد وروبوتات', 'RC', 'Cpu', 'from-purple-500 to-violet-700'),
('dolls-figures', 'دمى وشخصيات', 'Dolls', 'HeartHandshake', 'from-pink-400 to-rose-600'),
('board-games', 'ألعاب عائلية', 'Board Games', 'Dices', 'from-amber-500 to-red-500'),
('outdoor', 'حركية وخارجية', 'Outdoor', 'Bike', 'from-cyan-400 to-blue-600'),
('infant', 'الرضع', 'Baby', 'Baby', 'from-lime-400 to-emerald-600'),
('arts-crafts', 'فنون وإبداع', 'Arts', 'Palette', 'from-fuchsia-500 to-pink-600'),
('party', 'مستلزمات حفلات', 'Party Supplies', 'PartyPopper', 'from-yellow-400 to-pink-500'),
('balloons', 'بالونات جملة', 'Balloons', 'Balloon', 'from-sky-400 to-blue-500')
ON CONFLICT (id) DO NOTHING;
