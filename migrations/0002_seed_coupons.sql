-- ============================================================
-- Migration 0002: تهيئة الكوبونات في D1
-- مطابقة لـ src/data/coupons.js حتى تعمل نقطة /api/coupons/validate
-- ============================================================

INSERT INTO coupons (code, discount_percent, min_spend, user_type, is_active) VALUES
('OMRAN10', 10, 0,    'both', 1),
('TOYS20',  20, 1500, 'both', 1),
('EID2026', 15, 800,  'both', 1),
('FREESHIP', 0, 500,  'both', 1)
ON CONFLICT(code) DO NOTHING;
