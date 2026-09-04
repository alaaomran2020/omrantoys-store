const PRODUCT_ENGINE_ENDPOINT = '/api/products';
const REQUEST_TIMEOUT_MS = 8000;

const asText = (value) => (typeof value === 'string' ? value.trim() : '');

export function isPublishedProduct(product) {
  return Boolean(
    product &&
    product.active === true &&
    asText(product.workflowStatus) === 'PUBLISHED' &&
    asText(product.qaStatus) === 'PASS'
  );
}

/**
 * Convert the Product Engine public contract into the legacy Storefront shape.
 * Unknown commerce fields stay unknown; we never manufacture SKU, stock, brand,
 * age, discount, wholesale pricing or other catalog facts.
 */
export function adaptEngineProduct(product) {
  const id = asText(product?.id);
  const name = asText(product?.name);
  if (!id || !name || !isPublishedProduct(product)) return null;

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
    active: true,
    is_visible: true,
    sortOrder: Number.isFinite(product.sortOrder) ? product.sortOrder : null,
    productPrompt: asText(product.productPrompt),
    rowIndex: Number.isFinite(product.rowIndex) ? product.rowIndex : null,
    // حقول النشر أول-فئة (تصل من Product Engine البوابة) — تُمرَّر كما هي
    workflowStatus: asText(product.workflowStatus),
    qaStatus: asText(product.qaStatus),
    sourceDriveId: asText(product.sourceDriveId) || null,
    processedImage: asText(product.processedImage) || null,
    reviewReason: asText(product.reviewReason),
    catalogSource: 'product-engine',
  };
}

/**
 * Strict Product Engine payload validation (Fail-Closed):
 * - `status === 'ok'` مطلوب (الرد القديم/stale بلا status يُرفض فورًا)
 * - `products` مصفوفة ومؤكدة
 * أي شك → نحن لا نعرض شيئًا بدل أن نعرض بيانات غير موثقة.
 */
function isValidEnginePayload(payload) {
  return Boolean(
    payload &&
    payload.status === 'ok' &&
    Array.isArray(payload.products)
  );
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
    if (!isValidEnginePayload(payload)) {
      throw new Error('Invalid Product Engine payload (status must be "ok")');
    }

    const products = payload.products
      .map(adaptEngineProduct)
      .filter(Boolean);

    return {
      products,
      status: payload.status,
      fetchedAt: payload.fetchedAt || new Date().toISOString(),
    };
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}

export { PRODUCT_ENGINE_ENDPOINT };
