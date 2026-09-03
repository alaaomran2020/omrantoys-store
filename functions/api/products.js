const PRODUCT_ENGINE_URL = 'https://omrantoys.store/api/products';

export async function onRequest(context) {
  const request = context.request;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json; charset=utf-8', allow: 'GET, HEAD' },
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const upstream = await fetch(PRODUCT_ENGINE_URL, {
      method: request.method,
      headers: { accept: 'application/json' },
      signal: controller.signal,
      redirect: 'follow',
    });
    const headers = new Headers();
    headers.set('content-type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
    headers.set('cache-control', upstream.ok ? 'public, max-age=60' : 'no-store');
    headers.set('x-storefront-gateway', 'pages');
    return new Response(request.method === 'HEAD' ? null : upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    const timeout = error instanceof Error && error.name === 'AbortError';
    return new Response(JSON.stringify({
      products: [],
      status: 'error',
      fetchedAt: new Date().toISOString(),
      error: timeout ? 'product_engine_timeout' : 'product_engine_unavailable',
    }), {
      status: 502,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  } finally {
    clearTimeout(timer);
  }
}
