/**
 * Storefront same-origin gateway: /api/products
 *
 * شفاف تمامًا: يعيد جسم الـProduct Engine كما هو (بدون اختلاق أو تحوير حقول).
 * ترتيب المحاولات:
 *   1. https://omrantoys.store/api/products        (المسار الأساسي)
 *   2. https://omrantoys.store/edge-api/products   (مرآة — نفس محرك الحافة)
 * القبول فقط لو body = { status: 'ok', products: [...] }.
 * أي رد قديم/stale بلا status، أو غير صالح، أو خطأ → لا نعرض بيانات غير موثقة.
 */
const PRIMARY_ENGINE_URL = 'https://omrantoys.store/api/products';
const MIRROR_ENGINE_URL = 'https://omrantoys.store/edge-api/products';
const REQUEST_TIMEOUT_MS = 8000;

function isEnginePayloadValid(payload) {
  return Boolean(payload && payload.status === 'ok' && Array.isArray(payload.products));
}

async function fetchEngine(url, method, signal) {
  const response = await fetch(url, {
    method,
    headers: { accept: 'application/json' },
    signal,
    redirect: 'follow',
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  return { response, body, source: url };
}

export async function onRequest(context) {
  const request = context.request;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json; charset=utf-8', allow: 'GET, HEAD' },
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const errorResponse = (message) => new Response(JSON.stringify({
    products: [],
    status: 'error',
    fetchedAt: new Date().toISOString(),
    error: message,
  }), {
    status: 502,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-storefront-gateway': 'pages' },
  });

  try {
    // 1) المسار الأساسي لـ Product Engine
    let attempt = await fetchEngine(PRIMARY_ENGINE_URL, request.method, controller.signal);
    if (attempt.response.ok && isEnginePayloadValid(attempt.body)) {
      const headers = new Headers();
      headers.set('content-type', attempt.response.headers.get('content-type') || 'application/json; charset=utf-8');
      headers.set('cache-control', 'public, max-age=60');
      headers.set('x-storefront-gateway', 'pages');
      headers.set('x-storefront-source', 'product-engine');
      return new Response(request.method === 'HEAD' ? null : JSON.stringify(attempt.body), {
        status: attempt.response.status,
        headers,
      });
    }

    // 2) المرآة الـedge (نفس العقد) — لا نعرض ردًا بلا status أبدًا
    attempt = await fetchEngine(MIRROR_ENGINE_URL, request.method, controller.signal);
    if (attempt.response.ok && isEnginePayloadValid(attempt.body)) {
      const headers = new Headers();
      headers.set('content-type', attempt.response.headers.get('content-type') || 'application/json; charset=utf-8');
      headers.set('cache-control', 'public, max-age=60');
      headers.set('x-storefront-gateway', 'pages');
      headers.set('x-storefront-source', 'edge-mirror');
      return new Response(request.method === 'HEAD' ? null : JSON.stringify(attempt.body), {
        status: attempt.response.status,
        headers,
      });
    }

    return errorResponse('product_engine_unavailable_or_invalid');
  } catch (error) {
    const timeout = error instanceof Error && error.name === 'AbortError';
    return errorResponse(timeout ? 'product_engine_timeout' : 'product_engine_unreachable');
  } finally {
    clearTimeout(timer);
  }
}
