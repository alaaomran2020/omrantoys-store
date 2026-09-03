import assert from 'node:assert/strict';
import test from 'node:test';
import { adaptEngineProduct, isPublishedProduct } from '../src/lib/productEngine.js';
import { isEnginePayloadValid } from '../functions/api/products.js';

const published = { id: 'P-1', name: 'لعبة موثقة', active: true, workflowStatus: 'PUBLISHED', qaStatus: 'PASS' };

test('only the complete publication gate is public', () => {
  assert.equal(isPublishedProduct(published), true);
  for (const patch of [{ active: false }, { workflowStatus: 'NEEDS_REVIEW' }, { qaStatus: 'FAIL' }, { qaStatus: '' }]) {
    const product = { ...published, ...patch };
    assert.equal(isPublishedProduct(product), false);
    assert.equal(adaptEngineProduct(product), null);
  }
});

test('gateway rejects an entire payload containing an unpublished product', () => {
  assert.equal(isEnginePayloadValid({ status: 'ok', products: [published] }), true);
  assert.equal(isEnginePayloadValid({ status: 'ok', products: [published, { ...published, id: 'P-2', qaStatus: 'FAIL' }] }), false);
});
