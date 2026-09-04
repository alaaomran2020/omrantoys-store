/**
 * Cloudflare Pages gateway: GET|HEAD /api/products
 *
 * Ownership contract:
 * - Pages owns the public storefront and this same-origin gateway.
 * - The Product Engine owns a distinct upstream endpoint.
 * - The gateway must never call its own /api/products route.
 */
const DEFAULT_ENGINE_URL = 'https://omrantoys.store/edge-api/products';
const REQUEST_TIMEOUT_MS = 8000;

export function isEnginePayloadValid(payload) {
  return Boolean(
    payload &&
    payload.status === 'ok' &&
    Array.isArray(payload.products) &&
    payload.products.every((product) =>
      product &&
      typeof product.id === 'string' && product.id.trim() &&
      typeof product.name === 'string' && product.name.trim() &&
      product.active === true &&
      product.workflowStatus === 'PUBLISHED' &&
      product.qaStatus === 'PASS'
    )
  );
}

export function resolveEngineUrl(requestUrl, configuredUrl) {
  const incoming = new URL(requestUrl);
  const upstream = new URL(configuredUrl || DEFAULT_ENGINE_URL, incoming.origin);

  if (upstream.protocol !== 'https:' && upstream.hostname !== 'localhost' && upstream.hostname !== '127.0.0.1') {
    throw new Error('product_engine_url_must_use_https');
  }

  const sameGateway = upstream.origin === incoming.origin && upstream.pathname.replace(/\/+$/, '') === '/api/products';
  if (sameGateway) throw new Error('product_engine_recursive_url');

  for (const [key, value] of incoming.searchParams) upstream.searchParams.append(key, value);
  return upstream;
}

function jsonError(error, status = 502) {
  return new Response(JSON.stringify({
    products: [],
    status: 'error',
    fetchedAt: new Date().toISOString(),
    error,
  }), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-storefront-gateway': 'pages',
    },
  });
}

export async function onRequest(context) {
  const { request } = context;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return jsonError('method_not_allowed', 405);
  }

  let upstream;
  try {
    upstream = resolveEngineUrl(request.url, context.env?.PRODUCT_ENGINE_URL);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'product_engine_configuration_invalid', 500);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(upstream, {
      method: request.method,
      headers: { accept: 'application/json' },
      signal: controller.signal,
      redirect: 'error',
    });

    const text = request.method === 'HEAD' ? '' : await response.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = null; }

    if (!response.ok || (request.method !== 'HEAD' && !isEnginePayloadValid(body))) {
      return jsonError('product_engine_unavailable_or_invalid');
    }

    return new Response(request.method === 'HEAD' ? null : JSON.stringify(body), {
      status: response.status,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=60, stale-while-revalidate=120',
        'x-storefront-gateway': 'pages',
        'x-storefront-source': 'product-engine',
      },
    });
  } catch (error) {
    const timeout = error instanceof Error && error.name === 'AbortError';
    return jsonError(timeout ? 'product_engine_timeout' : 'product_engine_unreachable');
  } finally {
    clearTimeout(timer);
  }
}

export { DEFAULT_ENGINE_URL };
