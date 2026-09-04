import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_ENGINE_URL, onRequest, resolveEngineUrl } from '../functions/api/products.js';

test('default upstream is distinct from the public gateway', () => {
  const upstream = resolveEngineUrl('https://omrantoys.store/api/products?category=toys');
  assert.equal(upstream.origin + upstream.pathname, DEFAULT_ENGINE_URL);
  assert.equal(upstream.searchParams.get('category'), 'toys');
});

test('same-origin /api/products upstream is rejected', () => {
  assert.throws(
    () => resolveEngineUrl('https://omrantoys.store/api/products', 'https://omrantoys.store/api/products'),
    /product_engine_recursive_url/,
  );
});

test('gateway calls only the independent engine and returns its valid contract', async (t) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url) => {
    calls.push(String(url));
    return new Response(JSON.stringify({ status: 'ok', products: [] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const response = await onRequest({
    request: new Request('https://omrantoys.store/api/products?limit=10'),
    env: { PRODUCT_ENGINE_URL: 'https://engine.example.com/products' },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ['https://engine.example.com/products?limit=10']);
  assert.equal(response.headers.get('x-storefront-gateway'), 'pages');
});

test('recursive configuration fails closed without making a fetch', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('fetch must not be called');
  });

  const response = await onRequest({
    request: new Request('https://omrantoys.store/api/products'),
    env: { PRODUCT_ENGINE_URL: 'https://omrantoys.store/api/products' },
  });

  assert.equal(response.status, 500);
  assert.equal(fetchMock.mock.callCount(), 0);
  assert.equal((await response.json()).error, 'product_engine_recursive_url');
});
