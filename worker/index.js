/**
 * Omran Toys Store — Cloudflare Worker
 * API خلفية على D1 لطلبات /api/* + تقديم الواجهة (Static Assets / SPA)
 *
 * Endpoints:
 *   GET  /api/health              فحص الحالة واتصال قاعدة البيانات
 *   GET  /api/categories          كل التصنيفات النشطة
 *   GET  /api/products            المنتجات (?category=&search=&limit=&offset=)
 *   GET  /api/products/:id        منتج واحد (بالـ id أو الـ sku)
 *   POST /api/leads               تسجيل بيانات عميل (الاسم + الموبايل + فيسبوك)
 *   POST /api/orders              إنشاء طلب جديد + عناصره
 *   GET  /api/orders/:id          استعلام عن طلب برقمه (OMR-XXXX)
 */

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...CORS_HEADERS, ...extra },
  });

const badRequest = (message) => json({ success: false, error: message }, 400);
const notFound = (message = 'غير موجود') => json({ success: false, error: message }, 404);
const serverError = (message = 'خطأ داخلي في الخادم') => json({ success: false, error: message }, 500);

/** توليد رقم طلب بصيغة OMR-XXXX */
const generateOrderId = () =>
  `OMR-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, '0')}`;

/** تحويل حقول JSON النصية في صف المنتج إلى كائنات */
function parseProductRow(row) {
  if (!row) return row;
  const parsed = { ...row };
  for (const key of ['images', 'features', 'tags', 'age_range']) {
    if (typeof parsed[key] === 'string' && parsed[key]) {
      try {
        parsed[key] = JSON.parse(parsed[key]);
      } catch {
        /* اتركه نصاً كما هو */
      }
    }
  }
  return parsed;
}

async function handleApi(request, env, url) {
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // ---------- GET /api/health ----------
  if (path === '/api/health' && method === 'GET') {
    let database = 'unavailable';
    try {
      await env.DB.prepare('SELECT 1').first();
      database = 'ok';
    } catch {
      /* قاعدة البيانات غير متاحة */
    }
    return json({ success: true, service: 'omrantoys-store', database, time: new Date().toISOString() });
  }

  // ---------- GET /api/categories ----------
  if (path === '/api/categories' && method === 'GET') {
    const { results } = await env.DB.prepare(
      'SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order, name_ar'
    ).all();
    return json({ success: true, categories: results });
  }

  // ---------- GET /api/products ----------
  if (path === '/api/products' && method === 'GET') {
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 100);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);

    let query = 'SELECT * FROM products WHERE is_active = 1';
    const params = [];
    if (category && category !== 'all') {
      query += ' AND category_id = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (name_ar LIKE ? OR name_en LIKE ? OR sku LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const { results } = await env.DB.prepare(query).bind(...params).all();
    return json({ success: true, products: results.map(parseProductRow) });
  }

  // ---------- GET /api/products/:id ----------
  const productMatch = path.match(/^\/api\/products\/([^/]+)$/);
  if (productMatch && method === 'GET') {
    const id = decodeURIComponent(productMatch[1]);
    const row = await env.DB.prepare(
      'SELECT * FROM products WHERE (id = ?1 OR sku = ?1) AND is_active = 1'
    ).bind(id).first();
    if (!row) return notFound('المنتج غير موجود');
    return json({ success: true, product: parseProductRow(row) });
  }

  // ---------- POST /api/leads ----------
  if (path === '/api/leads' && method === 'POST') {
    let body;
    try {
      body = await request.json();
    } catch {
      return badRequest('جسم الطلب يجب أن يكون JSON صالحاً');
    }
    const fullName = String(body.full_name || body.fullName || '').trim();
    const phone = String(body.phone || '').trim();
    if (!fullName || !phone) return badRequest('الاسم ورقم الموبايل مطلوبان');

    await env.DB.prepare(
      'INSERT INTO leads (full_name, phone, facebook, source) VALUES (?, ?, ?, ?)'
    )
      .bind(fullName, phone, String(body.facebook || '').trim() || null, String(body.source || 'website-signup'))
      .run();
    return json({ success: true }, 201);
  }

  // ---------- POST /api/orders ----------
  if (path === '/api/orders' && method === 'POST') {
    let body;
    try {
      body = await request.json();
    } catch {
      return badRequest('جسم الطلب يجب أن يكون JSON صالحاً');
    }

    const customerName = String(body.customer_name || body.customerName || '').trim();
    const phone = String(body.phone || '').trim();
    const governorate = String(body.governorate || '').trim();
    const address = String(body.address || '').trim();
    const items = Array.isArray(body.items) ? body.items : [];

    if (!customerName || !phone || !governorate || !address) {
      return badRequest('بيانات العميل ناقصة (الاسم، الموبايل، المحافظة، العنوان)');
    }
    if (items.length === 0) return badRequest('لا يمكن إنشاء طلب بدون منتجات');

    const orderId = generateOrderId();
    const subtotal = Number(body.subtotal || 0);
    const discountAmount = Number(body.discount_amount || body.discountAmount || 0);
    const shippingCost = Number(body.shipping_cost || body.shippingCost || 0);
    const total = Number(body.total || subtotal - discountAmount + shippingCost);

    const statements = [
      env.DB.prepare(
        `INSERT INTO orders (
           id, customer_name, email, phone, governorate, city, address,
           subtotal, discount_amount, shipping_cost, total,
           shipping_method, payment_method, payment_gateway, notes
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        orderId,
        customerName,
        String(body.email || '').trim() || null,
        phone,
        governorate,
        String(body.city || '').trim() || null,
        address,
        subtotal,
        discountAmount,
        shippingCost,
        total,
        String(body.shipping_method || 'standard'),
        String(body.payment_method || body.paymentMethod || 'cod'),
        String(body.payment_gateway || body.paymentGateway || 'cod'),
        String(body.notes || '').trim() || null
      ),
    ];

    for (const item of items) {
      const quantity = Math.max(parseInt(item.quantity, 10) || 1, 1);
      const unitPrice = Number(item.unit_price ?? item.price ?? 0);
      statements.push(
        env.DB.prepare(
          `INSERT INTO order_items (
             order_id, product_id, product_sku, product_name, product_image,
             quantity, unit_price, total_price
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          orderId,
          item.product_id != null ? String(item.product_id) : null,
          item.sku != null ? String(item.sku) : null,
          String(item.name || item.product_name || 'منتج'),
          item.image != null ? String(item.image) : null,
          quantity,
          unitPrice,
          Number(item.total_price ?? unitPrice * quantity)
        )
      );
    }

    await env.DB.batch(statements);
    return json({ success: true, order_id: orderId, total }, 201);
  }

  // ---------- GET /api/orders/:id ----------
  const orderMatch = path.match(/^\/api\/orders\/([^/]+)$/);
  if (orderMatch && method === 'GET') {
    const id = decodeURIComponent(orderMatch[1]);
    const order = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
    if (!order) return notFound('الطلب غير موجود');
    const { results: orderItems } = await env.DB.prepare(
      'SELECT * FROM order_items WHERE order_id = ?'
    ).bind(id).all();
    return json({ success: true, order: { ...order, items: orderItems } });
  }

  return notFound('نقطة النهاية غير موجودة');
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(request, env, url);
      } catch (err) {
        console.error('API error:', err);
        return serverError();
      }
    }

    // كل ما عدا /api/* تقدمه الـ Static Assets (SPA fallback مفعل في wrangler.toml)
    return env.ASSETS.fetch(request);
  },
};
