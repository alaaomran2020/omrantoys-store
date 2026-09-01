/**
 * Payment Gateways Integration
 * Supports Paymob, Fawry, and COD for Egypt
 * Omran Toys Store
 */

export const PAYMENT_METHODS = {
  PAYMOB: {
    id: 'paymob',
    name: 'Paymob - بطاقات بنكية',
    nameEn: 'Paymob',
    icon: '💳',
    description: 'دفع آمن عبر Paymob - فيزا، ماستركارد، ميزة',
    currencies: ['EGP'],
    fees: 0,
  },
  FAWRY: {
    id: 'fawry',
    name: 'فوري',
    nameEn: 'Fawry',
    icon: '🏪',
    description: 'ادفع عبر فوري من أي مكان في مصر',
    currencies: ['EGP'],
    fees: 5, // EGP fixed
  },
  INSTAPAY: {
    id: 'instapay',
    name: 'إنستاباي والمحافظ',
    nameEn: 'InstaPay & Wallets',
    icon: '📱',
    description: 'فودافون كاش، أورنج كاش، إنستاباي',
    currencies: ['EGP'],
    fees: 0,
  },
  VALU: {
    id: 'valu',
    name: 'فاليو / أمان تقسيط',
    nameEn: 'ValU Installments',
    icon: '📅',
    description: 'قسط حتى 12 شهر بدون مقدم',
    currencies: ['EGP'],
    fees: 0,
  },
  COD: {
    id: 'cod',
    name: 'الدفع عند الاستلام',
    nameEn: 'Cash on Delivery',
    icon: '💵',
    description: 'ادفع نقداً عند وصول المندوب',
    currencies: ['EGP'],
    fees: 10, // Extra COD fee
  },
};

/**
 * Simulate Paymob payment initiation
 * In production, replace with actual API call
 */
export async function initiatePaymobPayment({ amount: _amount, orderId, customer: _customer, billingData: _billingData }) {
  // Mock implementation - replace with real Paymob API
  const paymobConfig = {
    apiKey: import.meta.env.VITE_PAYMOB_API_KEY,
    integrationId: import.meta.env.VITE_PAYMOB_INTEGRATION_ID,
    iframeId: import.meta.env.VITE_PAYMOB_IFRAME_ID,
  };

  if (!paymobConfig.apiKey) {
    console.warn('Paymob not configured, using mock');
    return {
      success: true,
      mock: true,
      paymentUrl: `https://accept.paymob.com/api/acceptance/iframes/${paymobConfig.iframeId || 'mock'}?payment_token=mock_token_${orderId}`,
      transactionId: `paymob_mock_${Date.now()}`,
    };
  }

  try {
    // Step 1: Auth token
    // const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ api_key: paymobConfig.apiKey })
    // });
    // const { token } = await authRes.json();

    // For now return mock
    return {
      success: true,
      mock: true,
      paymentUrl: `https://accept.paymob.com/api/acceptance/iframes/${paymobConfig.iframeId}?payment_token=mock`,
      transactionId: `paymob_${Date.now()}`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Simulate Fawry payment
 */
export async function initiateFawryPayment({ amount: _amount, orderId: _orderId, customer: _customer }) {
  const fawryConfig = {
    merchantCode: import.meta.env.VITE_FAWRY_MERCHANT_CODE,
  };

  if (!fawryConfig.merchantCode) {
    console.warn('Fawry not configured, using mock');
    return {
      success: true,
      mock: true,
      fawryCode: `FAW${Date.now().toString().slice(-8)}`,
      expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      transactionId: `fawry_mock_${Date.now()}`,
    };
  }

  return {
    success: true,
    mock: true,
    fawryCode: `FAW${Date.now().toString().slice(-8)}`,
    transactionId: `fawry_${Date.now()}`,
  };
}

/**
 * Calculate payment fees
 */
export function calculatePaymentFees(methodId, _subtotal) {
  const method = Object.values(PAYMENT_METHODS).find(m => m.id === methodId);
  if (!method) return 0;
  return method.fees || 0;
}

/**
 * Get payment method by ID
 */
export function getPaymentMethod(methodId) {
  return Object.values(PAYMENT_METHODS).find(m => m.id === methodId) || PAYMENT_METHODS.COD;
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(amount, methodId) {
  if (amount < 10) return { valid: false, error: 'الحد الأدنى للدفع 10 ج.م' };
  if (methodId === 'valu' && amount < 500) return { valid: false, error: 'التقسيط متاح للطلبات فوق 500 ج.م' };
  return { valid: true };
}
