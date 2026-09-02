/**
 * scripts/seed-d1-products.mjs
 * يولّد ملف SQL لزرع المنتجات التجريبية من src/data/products.js في D1.
 * الاستخدام:
 *   node scripts/seed-d1-products.mjs > cloudflare/d1-seed-products.sql
 *   npx wrangler d1 execute DB --local --file=cloudflare/d1-seed-products.sql
 */
import { initialProducts } from '../src/data/products.js';
import { writeFileSync } from 'node:fs';

const esc = (v) => (v == null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 'NULL');

const lines = ['-- بيانات تجريبية: تُولَّد من src/data/products.js (لا تُستخدم في الإنتاج)'];
for (const p of initialProducts) {
  const images = JSON.stringify(p.images || []);
  const features = JSON.stringify(p.features || []);
  const tags = JSON.stringify(p.tags || []);
  lines.push(
    `INSERT OR IGNORE INTO products (id, sku, name_ar, name_en, description, category_id,
       retail_price, original_price, discount_percent, stock_quantity, images, features, tags,
       age_group, brand, is_active, is_best_seller, is_new)
     VALUES (
       ${esc(String(p.id))}, ${esc(p.sku)}, ${esc(p.name)}, ${esc(p.nameEn || null)}, ${esc(p.description || null)},
       ${esc(p.category)}, ${num(p.price)}, ${p.originalPrice ? num(p.originalPrice) : 'NULL'}, ${num(p.discountPercent || 0)},
       ${num(p.stock)}, ${esc(images)}, ${esc(features)}, ${esc(tags)}, ${esc(p.ageGroup || null)},
       ${esc(p.brand || null)}, ${p.is_visible === false ? 0 : 1}, ${p.isBestSeller ? 1 : 0}, ${p.isNew ? 1 : 0}
     );`
  );
}
writeFileSync(new URL('../cloudflare/d1-seed-products.sql', import.meta.url), lines.join('\n') + '\n', 'utf8');
console.log(`✓ تم توليد ${initialProducts.length} منتج في cloudflare/d1-seed-products.sql`);
