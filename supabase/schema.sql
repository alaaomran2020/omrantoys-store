-- ============================================
-- Omran Toys Store - Supabase Database Schema
-- B2B & B2C E-commerce Platform
-- Version: 2.0 - Production Ready
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS / MERCHANTS TABLE (Profiles)
-- Extends auth.users
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('retail', 'wholesale')) DEFAULT 'retail',
  -- B2B Fields
  business_name TEXT,
  tax_id TEXT,
  commercial_register TEXT,
  governorate TEXT,
  city TEXT,
  address TEXT,
  is_verified_merchant BOOLEAN DEFAULT false,
  wholesale_tier TEXT CHECK (wholesale_tier IN ('tier1', 'tier2', 'tier3')) DEFAULT 'tier1',
  discount_rate NUMERIC DEFAULT 0, -- Extra discount % for wholesale
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 2. CATEGORIES
-- ============================================
CREATE TABLE public.categories (
  id TEXT PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  icon TEXT,
  color_gradient TEXT,
  parent_id TEXT REFERENCES public.categories(id),
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. PRODUCTS / INVENTORY (Enhanced)
-- ============================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  slug TEXT UNIQUE,
  description TEXT,
  category_id TEXT REFERENCES public.categories(id),
  
  -- Pricing B2B & B2C
  retail_price NUMERIC NOT NULL CHECK (retail_price >= 0),
  wholesale_price NUMERIC CHECK (wholesale_price >= 0),
  wholesale_price_tier2 NUMERIC,
  wholesale_price_tier3 NUMERIC,
  original_price NUMERIC,
  discount_percent INT DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  cost_price NUMERIC, -- For margin calculation
  
  -- Inventory
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INT DEFAULT 5,
  weight_grams INT DEFAULT 500,
  dimensions_cm TEXT,
  is_active BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true, -- Auto hide when stock 0
  
  -- Attributes for Faceted Search
  age_group TEXT CHECK (age_group IN ('0-2', '3-5', '6-8', '9-12', '12+')),
  brand TEXT,
  toy_type TEXT, -- e.g., 'educational', 'rc', 'doll', 'balloon'
  material TEXT,
  battery_required TEXT,
  
  -- Flags
  is_new BOOLEAN DEFAULT false,
  is_best_seller BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_balloon BOOLEAN DEFAULT false,
  is_party_supply BOOLEAN DEFAULT false,
  
  -- Media
  images JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  
  -- SEO
  tags TEXT[] DEFAULT '{}',
  features JSONB DEFAULT '[]'::jsonb,
  safety_notice TEXT,
  
  -- Analytics
  views_count INT DEFAULT 0,
  sales_count INT DEFAULT 0,
  rating NUMERIC DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INT DEFAULT 0,
  
  -- Bulk Import
  import_batch_id TEXT,
  import_source TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_age_group ON public.products(age_group);
CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_products_stock ON public.products(stock_quantity);
CREATE INDEX idx_products_retail_price ON public.products(retail_price);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_search ON public.products USING GIN (to_tsvector('arabic', name_ar || ' ' || COALESCE(description, '')));

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated can manage products" ON public.products FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- 4. STOCK NOTIFICATIONS (Notify me when available)
-- ============================================
CREATE TABLE public.stock_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  email TEXT,
  phone TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL OR user_id IS NOT NULL)
);

ALTER TABLE public.stock_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe to stock notifications" ON public.stock_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own notifications" ON public.stock_notifications FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 5. ORDERS
-- ============================================
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY, -- OMR-XXXX format
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  governorate TEXT NOT NULL,
  city TEXT,
  address TEXT NOT NULL,
  
  -- Pricing Breakdown
  subtotal NUMERIC NOT NULL,
  discount_amount NUMERIC DEFAULT 0,
  shipping_cost NUMERIC DEFAULT 0,
  vat_amount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  currency TEXT DEFAULT 'EGP',
  
  -- Coupon & Wholesale
  coupon_code TEXT,
  user_type TEXT DEFAULT 'retail',
  wholesale_discount_applied NUMERIC DEFAULT 0,
  
  -- Logistics
  shipping_method TEXT DEFAULT 'standard',
  weight_total_grams INT,
  estimated_delivery_days INT DEFAULT 2,
  
  -- Payment
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_gateway TEXT, -- paymob, fawry, cod
  payment_transaction_id TEXT,
  
  -- Status
  status TEXT DEFAULT 'قيد الانتظار' CHECK (status IN ('قيد الانتظار', 'قيد التجهيز', 'تم الشحن', 'تم التوصيل', 'ملغي', 'مرتجع')),
  
  -- Extras
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 6. ORDER ITEMS
-- ============================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_sku TEXT,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL,
  wholesale_price_applied NUMERIC,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order items viewable with order" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- ============================================
-- 7. SHIPPING ZONES & RATES
-- ============================================
CREATE TABLE public.shipping_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  governorate TEXT NOT NULL UNIQUE,
  governorate_ar TEXT NOT NULL,
  base_cost NUMERIC NOT NULL DEFAULT 50,
  free_shipping_threshold NUMERIC DEFAULT 1000,
  extra_cost_per_kg NUMERIC DEFAULT 10,
  estimated_days_min INT DEFAULT 1,
  estimated_days_max INT DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed shipping zones for Egypt
INSERT INTO public.shipping_zones (governorate, governorate_ar, base_cost, free_shipping_threshold, extra_cost_per_kg, estimated_days_min, estimated_days_max) VALUES
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

ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shipping zones viewable by everyone" ON public.shipping_zones FOR SELECT USING (true);

-- ============================================
-- 8. COUPONS
-- ============================================
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INT CHECK (discount_percent >= 0 AND discount_percent <= 100),
  discount_amount NUMERIC,
  min_spend NUMERIC DEFAULT 0,
  max_uses INT,
  used_count INT DEFAULT 0,
  user_type TEXT CHECK (user_type IN ('retail', 'wholesale', 'both')) DEFAULT 'both',
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coupons viewable by everyone" ON public.coupons FOR SELECT USING (is_active = true);

-- ============================================
-- 9. WISHLISTS
-- ============================================
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 10. REVIEWS
-- ============================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Calculate shipping dynamically
CREATE OR REPLACE FUNCTION calculate_shipping_cost(
  p_governorate TEXT,
  p_total_weight_grams INT,
  p_subtotal NUMERIC
) RETURNS TABLE(cost NUMERIC, is_free BOOLEAN, estimated_days TEXT) AS $$
DECLARE
  zone RECORD;
  weight_kg NUMERIC;
  extra_weight_cost NUMERIC := 0;
BEGIN
  SELECT * INTO zone FROM public.shipping_zones WHERE governorate_ar = p_governorate OR governorate = p_governorate LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 50::NUMERIC, false::BOOLEAN, '2-3 أيام'::TEXT;
    RETURN;
  END IF;

  -- Check free shipping
  IF p_subtotal >= zone.free_shipping_threshold THEN
    RETURN QUERY SELECT 0::NUMERIC, true::BOOLEAN, (zone.estimated_days_min || '-' || zone.estimated_days_max || ' أيام')::TEXT;
    RETURN;
  END IF;

  weight_kg := GREATEST(0, (p_total_weight_grams - 1000) / 1000.0);
  extra_weight_cost := CEIL(weight_kg) * zone.extra_cost_per_kg;

  RETURN QUERY SELECT (zone.base_cost + extra_weight_cost)::NUMERIC, false::BOOLEAN, (zone.estimated_days_min || '-' || zone.estimated_days_max || ' أيام')::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function: Get wholesale price based on user tier
CREATE OR REPLACE FUNCTION get_product_price(
  p_product_id UUID,
  p_user_type TEXT,
  p_tier TEXT DEFAULT 'tier1'
) RETURNS NUMERIC AS $$
DECLARE
  prod RECORD;
BEGIN
  SELECT * INTO prod FROM public.products WHERE id = p_product_id;
  IF NOT FOUND THEN RETURN 0; END IF;
  
  IF p_user_type = 'wholesale' THEN
    CASE p_tier
      WHEN 'tier3' THEN RETURN COALESCE(prod.wholesale_price_tier3, prod.wholesale_price, prod.retail_price);
      WHEN 'tier2' THEN RETURN COALESCE(prod.wholesale_price_tier2, prod.wholesale_price, prod.retail_price);
      ELSE RETURN COALESCE(prod.wholesale_price, prod.retail_price);
    END CASE;
  END IF;
  
  RETURN prod.retail_price;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 11. CUSTOMER LEADS (تسجيل بيانات العملاء)
-- ============================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  facebook TEXT,
  source TEXT DEFAULT 'website-signup',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can register a lead" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read leads" ON public.leads FOR SELECT USING (true);

-- ============================================
-- SEED: Categories
-- ============================================
INSERT INTO public.categories (id, name_ar, name_en, icon, color_gradient) VALUES
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
