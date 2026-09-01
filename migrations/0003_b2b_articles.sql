-- ============================================================
-- Migration 0003: جدول مقالات B2B (كان مستخدماً في d1-tests.sql
-- بدون تعريف في المخطط — أُضيف هنا وفي cloudflare/d1-schema.sql)
-- ============================================================

CREATE TABLE IF NOT EXISTS b2b_articles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  slug TEXT UNIQUE NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  excerpt_ar TEXT,
  content_ar TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'market_data', 'pricing', 'logistics', 'guides')),
  target_audience TEXT DEFAULT 'both' CHECK (target_audience IN ('retail', 'wholesale', 'both')),
  data_sources TEXT, -- JSON نصي: قائمة مصادر البيانات
  is_published INTEGER DEFAULT 0 CHECK (is_published IN (0, 1)),
  published_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_b2b_articles_slug      ON b2b_articles(slug);
CREATE INDEX IF NOT EXISTS idx_b2b_articles_published ON b2b_articles(is_published, published_at DESC);
