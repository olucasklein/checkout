import { Product, CheckoutData, ApiResponse, OrderResponse } from '@/types/checkout';

// URL base da API - será configurada via variável de ambiente
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Dados mockados para desenvolvimento
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'MacBook Pro 14"',
    description: 'Apple M3 Pro, 18GB RAM, 512GB SSD',
    price: 12999.00,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=120&h=120&fit=crop&q=80',
  },
  {
    id: '2',
    name: 'Magic Mouse',
    description: 'Superfície Multi-Touch',
    price: 849.00,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=120&h=120&fit=crop&q=80',
  },
  {
    id: '3',
    name: 'Magic Keyboard',
    description: 'Teclado Moderno',
    price: 299.00,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=120&h=120&fit=crop&q=80',
  },
];

// Simula delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Flag para usar mock ou API real
const USE_MOCK = true;

// ========================================
// API de Produtos
// ========================================

export async function getCartProducts(): Promise<ApiResponse<Product[]>> {
  if (USE_MOCK) {
    await delay(500);
    return { success: true, data: MOCK_PRODUCTS };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/cart`);
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, error: 'Erro ao carregar produtos' };
  }
}

// ========================================
// API de CEP / Endereço
// ========================================

export async function fetchAddressByZipCode(zipCode: string): Promise<ApiResponse<{
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}>> {
  // Remove caracteres não numéricos
  const cleanZip = zipCode.replace(/\D/g, '');
  
  if (cleanZip.length !== 8) {
    return { success: false, error: 'CEP inválido' };
  }

  try {
    // Usando API pública do ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`);
    const data = await response.json();

    if (data.erro) {
      return { success: false, error: 'CEP não encontrado' };
    }

    return {
      success: true,
      data: {
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
      },
    };
  } catch (error) {
    return { success: false, error: 'Erro ao buscar CEP' };
  }
}

// ========================================
// API de Frete
// ========================================

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: number;
  description?: string;
}

export async function calculateShipping(zipCode: string): Promise<ApiResponse<ShippingOption[]>> {
  if (USE_MOCK) {
    await delay(800);
    return {
      success: true,
      data: [
        { id: 'standard', name: 'Padrão', price: 29.90, estimatedDays: 7, description: 'Entrega econômica' },
        { id: 'express', name: 'Expresso', price: 49.90, estimatedDays: 3, description: 'Entrega rápida' },
        { id: 'same-day', name: 'Mesmo dia', price: 99.90, estimatedDays: 0, description: 'Receba hoje!' },
      ],
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/shipping/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zipCode }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, error: 'Erro ao calcular frete' };
  }
}

// ========================================
// API de Cupom
// ========================================

export interface CouponData {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
}

export async function validateCoupon(code: string): Promise<ApiResponse<CouponData>> {
  if (USE_MOCK) {
    await delay(600);
    
    const coupons: Record<string, CouponData> = {
      'WELCOME10': { code: 'WELCOME10', discountType: 'percentage', discountValue: 10 },
      'SAVE50': { code: 'SAVE50', discountType: 'fixed', discountValue: 50, minPurchase: 200 },
      'FREESHIP': { code: 'FREESHIP', discountType: 'fixed', discountValue: 29.90 },
    };

    const coupon = coupons[code.toUpperCase()];
    if (coupon) {
      return { success: true, data: coupon, message: 'Cupom aplicado com sucesso!' };
    }
    return { success: false, error: 'Cupom inválido ou expirado' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, error: 'Erro ao validar cupom' };
  }
}

// ========================================
// API de Pagamento
// ========================================

export async function processPayment(checkoutData: CheckoutData): Promise<ApiResponse<OrderResponse>> {
  if (USE_MOCK) {
    await delay(2000);
    
    // Simula sucesso em 90% dos casos
    if (Math.random() > 0.1) {
      return {
        success: true,
        data: {
          orderId: `ORD-${Date.now()}`,
          status: 'confirmed',
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        message: 'Pedido realizado com sucesso!',
      };
    }
    return { success: false, error: 'Pagamento recusado. Verifique os dados do cartão.' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, error: 'Erro ao processar pagamento' };
  }
}

// ========================================
// Validação de Cartão
// ========================================

export function validateCardNumber(number: string): boolean {
  const cleanNumber = number.replace(/\D/g, '');
  if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;
  
  // Algoritmo de Luhn
  let sum = 0;
  let isEven = false;
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

export function getCardBrand(number: string): string {
  const cleanNumber = number.replace(/\D/g, '');
  
  if (/^4/.test(cleanNumber)) return 'visa';
  if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
  if (/^3[47]/.test(cleanNumber)) return 'amex';
  if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
  if (/^(?:2131|1800|35)/.test(cleanNumber)) return 'jcb';
  if (/^3(?:0[0-5]|[68])/.test(cleanNumber)) return 'diners';
  if (/^(636368|438935|504175|451416|636297|5067|4576|4011)/.test(cleanNumber)) return 'elo';
  if (/^(606282|3841)/.test(cleanNumber)) return 'hipercard';
  
  return 'generic';
}

// ========================================
// Formatadores
// ========================================

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatCardNumber(value: string): string {
  const cleanValue = value.replace(/\D/g, '');
  const groups = cleanValue.match(/.{1,4}/g) || [];
  return groups.join(' ').substring(0, 19);
}

export function formatExpiryDate(value: string): string {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length >= 2) {
    return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}`;
  }
  return cleanValue;
}

export function formatPhone(value: string): string {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length <= 2) return cleanValue;
  if (cleanValue.length <= 7) return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2)}`;
  return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 7)}-${cleanValue.slice(7, 11)}`;
}

export function formatZipCode(value: string): string {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length <= 5) return cleanValue;
  return `${cleanValue.slice(0, 5)}-${cleanValue.slice(5, 8)}`;
}

export function formatCPF(value: string): string {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length <= 3) return cleanValue;
  if (cleanValue.length <= 6) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3)}`;
  if (cleanValue.length <= 9) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6)}`;
  return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6, 9)}-${cleanValue.slice(9, 11)}`;
}
