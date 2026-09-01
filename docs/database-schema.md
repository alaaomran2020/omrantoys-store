# مخطط قاعدة البيانات - Omran Toys Store (Supabase)

## نظرة عامة

قاعدة بيانات PostgreSQL عبر Supabase مع 10 جداول، مصممة لدعم B2B & B2C، آلاف المنتجات، وشحن ديناميكي.

---

## 1. `profiles` - المستخدمين/التجار

**الغرض**: يمتد من `auth.users` لتخزين نوع المستخدم وبيانات التاجر.

```sql
id UUID PK → auth.users(id)
email TEXT NOT NULL
full_name TEXT NOT NULL
phone TEXT
user_type TEXT CHECK ('retail','wholesale') DEFAULT 'retail'
business_name TEXT -- للجملة فقط
tax_id TEXT
commercial_register TEXT
governorate TEXT
city TEXT
address TEXT
is_verified_merchant BOOLEAN DEFAULT false
wholesale_tier TEXT CHECK ('tier1','tier2','tier3') DEFAULT 'tier1'
discount_rate NUMERIC DEFAULT 0 -- خصم إضافي
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

**RLS**:
- SELECT: public
- INSERT: auth.uid() = id
- UPDATE: auth.uid() = id

**Indexes**: id, user_type, governorate

---

## 2. `categories` - الفئات

```sql
id TEXT PK -- مثل 'balloons', 'party', 'educational'
name_ar TEXT
name_en TEXT
icon TEXT
color_gradient TEXT
parent_id TEXT FK categories(id) -- لفئات فرعية
is_active BOOLEAN
sort_order INT
```

**Seed**: 11 فئة تشمل balloons و party.

---

## 3. `products` - المنتجات/المخزون (الجدول الأهم)

**تصميم يدعم Bulk Import + B2B Pricing + Auto-hide**:

```sql
id UUID PK DEFAULT uuid_generate_v4()
sku TEXT UNIQUE NOT NULL -- OMR-XXX
name_ar TEXT NOT NULL
name_en TEXT
slug TEXT UNIQUE
description TEXT
category_id TEXT FK categories(id)

-- Pricing B2B & B2C
retail_price NUMERIC NOT NULL CHECK >=0
wholesale_price NUMERIC -- Tier1
wholesale_price_tier2 NUMERIC -- Tier2
wholesale_price_tier3 NUMERIC -- Tier3
original_price NUMERIC
discount_percent INT CHECK 0-100
cost_price NUMERIC -- لحساب هامش

-- Inventory
stock_quantity INT NOT NULL DEFAULT 0 CHECK >=0
low_stock_threshold INT DEFAULT 5
weight_grams INT DEFAULT 500 -- مهم للشحن
dimensions_cm TEXT -- "20x30x15 cm"
is_active BOOLEAN DEFAULT true
is_visible BOOLEAN DEFAULT true -- Auto hide when stock 0

-- Faceted Search Attributes
age_group TEXT CHECK ('0-2','3-5','6-8','9-12','12+')
brand TEXT
toy_type TEXT -- educational, rc, doll, balloon
material TEXT
battery_required TEXT

-- Flags
is_new BOOLEAN
is_best_seller BOOLEAN
is_featured BOOLEAN
is_balloon BOOLEAN DEFAULT false
is_party_supply BOOLEAN DEFAULT false

-- Media
images JSONB DEFAULT []
video_url TEXT

-- SEO & Features
tags TEXT[] DEFAULT {}
features JSONB DEFAULT []
safety_notice TEXT

-- Analytics
views_count INT DEFAULT 0
sales_count INT DEFAULT 0
rating NUMERIC CHECK 0-5
reviews_count INT DEFAULT 0

-- Bulk Import
import_batch_id TEXT
import_source TEXT

created_at, updated_at
```

**Indexes**:
- category, age_group, brand, stock_quantity, retail_price, is_active, slug, sku
- GIN index على tsvector عربي للبحث

**RLS**: SELECT where is_active=true, ALL for authenticated (admin)

**Logic**:
- عند stock=0 → is_visible=false تلقائياً (اختياري) أو يظهر زر "أعلمني"
- wholesale_price = retail * 0.75 افتراضياً

---

## 4. `stock_notifications` - أعلمني عند التوفر

```sql
id UUID PK
product_id UUID FK products(id) ON DELETE CASCADE
email TEXT
phone TEXT
user_id UUID FK profiles(id) ON DELETE SET NULL
is_notified BOOLEAN DEFAULT false
created_at

CONSTRAINT: email OR phone OR user_id NOT NULL
```

**RLS**: INSERT public, SELECT own

**Use**: عندما ينفد منتج، المستخدم يدخل email/phone → عند إعادة التعبئة، إرسال إشعار.

---

## 5. `orders` - الطلبات

```sql
id TEXT PK -- OMR-XXXX format
user_id UUID FK profiles(id) ON DELETE SET NULL
customer_name TEXT NOT NULL
email TEXT
phone TEXT NOT NULL
governorate TEXT NOT NULL
city TEXT
address TEXT NOT NULL

-- Pricing
subtotal NUMERIC NOT NULL
discount_amount NUMERIC DEFAULT 0
shipping_cost NUMERIC DEFAULT 0
vat_amount NUMERIC DEFAULT 0
total NUMERIC NOT NULL
currency TEXT DEFAULT 'EGP'

-- Wholesale
user_type TEXT DEFAULT 'retail'
wholesale_discount_applied NUMERIC DEFAULT 0

-- Logistics
shipping_method TEXT DEFAULT 'standard'
weight_total_grams INT
estimated_delivery_days INT DEFAULT 2

-- Payment
payment_method TEXT NOT NULL
payment_status TEXT CHECK ('pending','paid','failed','refunded') DEFAULT 'pending'
payment_gateway TEXT -- paymob, fawry, cod
payment_transaction_id TEXT

-- Status
status TEXT CHECK ('قيد الانتظار','قيد التجهيز','تم الشحن','تم التوصيل','ملغي','مرتجع') DEFAULT 'قيد الانتظار'

notes TEXT

created_at, updated_at
```

**Indexes**: user_id, status, created_at DESC

**RLS**: SELECT own or null user_id, INSERT public

---

## 6. `order_items` - بنود الطلب

```sql
id UUID PK
order_id TEXT FK orders(id) ON DELETE CASCADE NOT NULL
product_id UUID FK products(id) ON DELETE SET NULL
product_sku TEXT
product_name TEXT NOT NULL
product_image TEXT
quantity INT CHECK >0
unit_price NUMERIC NOT NULL
wholesale_price_applied NUMERIC -- لو تاجر
total_price NUMERIC NOT NULL
created_at
```

---

## 7. `shipping_zones` - مناطق الشحن

**جدول مرجعي يحسب التكلفة ديناميكياً**:

```sql
id UUID PK
governorate TEXT UNIQUE NOT NULL -- English
governorate_ar TEXT NOT NULL -- عربي
base_cost NUMERIC DEFAULT 50
free_shipping_threshold NUMERIC DEFAULT 1000
extra_cost_per_kg NUMERIC DEFAULT 10
estimated_days_min INT DEFAULT 1
estimated_days_max INT DEFAULT 3
is_active BOOLEAN DEFAULT true
created_at
```

**Seed Data**: 24 محافظة مصرية مع تكلفة فعلية:

- القاهرة: 50 ج.م، مجاني فوق 1000، 1-2 يوم
- طنطا (غربية): 40 ج.م، مجاني فوق 800، 1-2 يوم
- أسوان: 90 ج.م، مجاني فوق 1300، 3-5 أيام
- ... إلخ

**Function**:
```sql
calculate_shipping_cost(governorate, weight_grams, subtotal)
RETURNS TABLE(cost, is_free, estimated_days)
```

**Logic**:
- أول 1 كجم مشمول
- كل كجم إضافي: extra_cost_per_kg
- لو subtotal >= free_threshold → cost=0

---

## 8. `wishlists` - المفضلة

```sql
id UUID PK
user_id UUID FK profiles(id) ON DELETE CASCADE NOT NULL
product_id UUID FK products(id) ON DELETE CASCADE NOT NULL
created_at
UNIQUE(user_id, product_id)
```

**RLS**: ALL where auth.uid()=user_id

---

## 9. `reviews` - التقييمات

```sql
id UUID PK
product_id UUID FK products(id) ON DELETE CASCADE NOT NULL
user_id UUID FK profiles(id) ON DELETE SET NULL
author_name TEXT NOT NULL
rating INT CHECK 1-5
comment TEXT
is_verified_purchase BOOLEAN DEFAULT false
created_at
```

---

## 10. `leads` - بيانات العملاء المسجلين (نموذج التسجيل)

```sql
id UUID PK
full_name TEXT NOT NULL
phone TEXT NOT NULL -- بصيغة دولية 20XXXXXXXXXX
facebook TEXT
source TEXT DEFAULT 'website-signup'
notes TEXT
created_at
```

**الاستخدام**: نموذج «سجّل بياناتك» الذي يظهر للزائر عند أول دخول للموقع (الاسم + الموبايل + حساب الفيسبوك) لتعبئة بيانات طلباته بسرعة.

---

## Functions & Triggers

### Auto-update updated_at

```sql
CREATE FUNCTION update_updated_at_column() RETURNS TRIGGER
```

Triggers on: profiles, products, orders

### calculate_shipping_cost

```sql
FUNCTION calculate_shipping_cost(
  p_governorate TEXT,
  p_total_weight_grams INT,
  p_subtotal NUMERIC
) RETURNS TABLE(cost NUMERIC, is_free BOOLEAN, estimated_days TEXT)
```

- يبحث عن zone حسب governorate_ar أو governorate
- لو subtotal >= free_threshold → مجاني
- يحسب وزن إضافي: CEIL((weight-1000)/1000) * extra_per_kg

### get_product_price

```sql
FUNCTION get_product_price(
  p_product_id UUID,
  p_user_type TEXT,
  p_tier TEXT DEFAULT 'tier1'
) RETURNS NUMERIC
```

- لو wholesale + tier3 → wholesale_price_tier3
- tier2 → tier2
- tier1 → wholesale_price
- retail → retail_price

---

## العلاقات (ERD)

```
auth.users 1--1 profiles
profiles 1--* orders
profiles 1--* wishlists
profiles 1--* reviews
profiles 1--* stock_notifications

categories 1--* products
categories 1--* categories (self parent)

products 1--* stock_notifications
products 1--* order_items
products 1--* reviews
products 1--* wishlists

orders 1--* order_items

shipping_zones (standalone reference)

leads (standalone capture)
```

---

## Bulk Import Flow

1. Admin يرفع JSON: `[{name, price, wholesale_price, category, stock, ...}]`
2. Frontend يحلل ويعرض preview مع validation
3. عند تأكيد: `INSERT INTO products ... import_batch_id = batch_<timestamp>`
4. يمكن تتبع الدفعة: `SELECT * FROM products WHERE import_batch_id = '...'`

---

## مثال استعلامات

### منتجات مع أسعار جملة لتاجر tier2

```sql
SELECT 
  id, name_ar, retail_price,
  get_product_price(id, 'wholesale', 'tier2') as wholesale_price
FROM products
WHERE is_active = true
AND stock_quantity > 0
ORDER BY sales_count DESC;
```

### حساب شحن

```sql
SELECT * FROM calculate_shipping_cost('طنطا (الغربية)', 2500, 850);
-- → cost=40, is_free=false, estimated_days='1-2 أيام'
```

### بيانات العملاء المسجلين

```sql
SELECT full_name, phone, facebook, source, created_at
FROM leads
ORDER BY created_at DESC;
```

---

## الأمان

- RLS مفعّل على كل الجداول
- Policies: قراءة عامة للمنتجات والمقالات المنشورة، كتابة للمصادقين
- لا يمكن للمستخدم تعديل profile غيره
- لا يمكن رؤية طلبات غيره (إلا null user_id للضيوف)

---

## التوسع المستقبلي

- Partitioning لـ orders حسب التاريخ (آلاف الطلبات)
- Full-text search عربي مع pg_trgm
- Supabase Realtime لـ stock_notifications
- Storage Bucket لصور المنتجات
