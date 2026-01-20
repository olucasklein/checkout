// ========================================
// Checkout Configuration
// ========================================
// Configure estas opções para personalizar o checkout

export const checkoutConfig = {
  // ========================================
  // Recursos habilitados
  // ========================================
  features: {
    // Habilita campo de cupom de desconto
    enableCoupon: true,
    
    // Habilita opções de frete (se false, frete será grátis)
    enableShipping: true,
    
    // Habilita seleção de parcelas
    enableInstallments: true,
  },

  // ========================================
  // Métodos de pagamento disponíveis
  // ========================================
  paymentMethods: {
    credit: true,   // Cartão de crédito
    debit: true,    // Cartão de débito
    pix: true,      // Pix
    boleto: true,   // Boleto bancário
  },

  // ========================================
  // Bandeiras de cartão aceitas
  // ========================================
  cardBrands: {
    visa: true,
    mastercard: true,
    amex: true,
    elo: true,
    hipercard: true,
    discover: false,
    diners: false,
  },

  // ========================================
  // Configurações de parcelamento
  // ========================================
  installments: {
    maxInstallments: 12,
    minInstallmentValue: 50, // Valor mínimo da parcela
    interestFree: true, // Sem juros
  },

  // ========================================
  // Desconto no Pix
  // ========================================
  pixDiscount: {
    enabled: true,
    percentage: 10, // 10% de desconto
  },

  // ========================================
  // Configurações visuais
  // ========================================
  ui: {
    showCardPreview: true,
    showOrderBenefits: true,
    animateSteps: true,
  },
};

export type CheckoutConfig = typeof checkoutConfig;
