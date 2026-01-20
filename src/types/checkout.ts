// Tipos para o sistema de checkout

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ShippingAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentInfo {
  method: 'credit' | 'debit' | 'pix' | 'boleto';
  cardNumber?: string;
  cardName?: string;
  expiryDate?: string;
  cvv?: string;
  installments?: number;
}

export interface CheckoutData {
  customer: CustomerInfo;
  shipping: ShippingAddress;
  payment: PaymentInfo;
  products: Product[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
}

export type CheckoutStep = 'customer' | 'shipping' | 'payment' | 'review';

export interface CheckoutState {
  currentStep: CheckoutStep;
  data: Partial<CheckoutData>;
  isLoading: boolean;
  errors: Record<string, string>;
}

// Tipos para resposta da API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface OrderResponse {
  orderId: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';
  estimatedDelivery?: string;
  paymentUrl?: string;
}
