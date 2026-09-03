const PRODUCT_ENGINE_ENDPOINT = '/api/products';
const REQUEST_TIMEOUT_MS = 8000;

const asText = (value) => (typeof value === 'string' ? value.trim() : '');

/**
 * Convert the Product Engine public contract into the legacy Storefront shape.
 * Unknown commerce fields stay unknown; we never manufacture SKU, stock, brand,
 * age, discount, wholesale pricing or other catalog facts.
 */
export function adaptEngineProduct(product) {
  const id = asText(product?.id);
  const name = asText(product?.name);
  if (!id || !name) return null;

  const price = typeof product.price === 'number' && Number.isFinite(product.price)
    ? product.price
    : null;
  const image = asText(product.image) || null;

  return {
    id,
    name,
    nameEn: '',
    category: asText(product.category),
    price,
    retail_price: price,
    originalPrice: null,
    discountPercent: 0,
    stock: null,
    stock_quantity: null,
    ageGroup: '',
    brand: '',
    isNew: false,
    isBestSeller: false,
    isFeatured: false,
    sku: '',
    description: asText(product.description),
    features: [],
    dimensions: '',
    batteryRequired: '',
    safetyNotice: '',
    images: image ? [image] : [],
    imageSource: asText(product.imageSource) || null,
    tags: [],
    active: product.active !== false,
    is_visible: product.active !== false,
    sortOrder: Number.isFinite(product.sortOrder) ? product.sortOrder : null,
    productPrompt: asText(product.productPrompt),
    rowIndex: Number.isFinite(product.rowIndex) ? product.rowIndex : null,
    catalogSource: 'product-engine',
  };
}

export async function fetchStorefrontProducts({
  endpoint = PRODUCT_ENGINE_ENDPOINT,
  signal,
} = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener('abort', abortFromCaller, { once: true });

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Product Engine HTTP ${response.status}`);

    const payload = await response.json();
    if (!payload || !Array.isArray(payload.products)) {
      throw new Error('Invalid Product Engine payload');
    }

    const products = payload.products
      .map(adaptEngineProduct)
      .filter(Boolean)
      .filter((product) => product.active !== false);

    return {
      products,
      status: payload.status || 'ok',
      fetchedAt: payload.fetchedAt || new Date().toISOString(),
    };
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}

export { PRODUCT_ENGINE_ENDPOINT };
