'use client';

import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { 
  CheckoutData, 
  CheckoutStep, 
  CustomerInfo, 
  ShippingAddress, 
  PaymentInfo,
  Product 
} from '@/types/checkout';

interface CheckoutState {
  currentStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  customer: CustomerInfo;
  shipping: ShippingAddress;
  payment: PaymentInfo;
  products: Product[];
  shippingCost: number;
  discount: number;
  couponCode: string | null;
  isLoading: boolean;
  errors: Record<string, string>;
}

type CheckoutAction =
  | { type: 'SET_STEP'; payload: CheckoutStep }
  | { type: 'COMPLETE_STEP'; payload: CheckoutStep }
  | { type: 'SET_CUSTOMER'; payload: CustomerInfo }
  | { type: 'SET_SHIPPING'; payload: ShippingAddress }
  | { type: 'SET_PAYMENT'; payload: PaymentInfo }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_SHIPPING_COST'; payload: number }
  | { type: 'SET_DISCOUNT'; payload: { amount: number; code: string } }
  | { type: 'CLEAR_DISCOUNT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'RESET_CHECKOUT' };

const initialState: CheckoutState = {
  currentStep: 'customer',
  completedSteps: [],
  customer: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  },
  shipping: {
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil',
  },
  payment: {
    method: 'credit',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    installments: 1,
  },
  products: [],
  shippingCost: 0,
  discount: 0,
  couponCode: null,
  isLoading: false,
  errors: {},
};

function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'COMPLETE_STEP':
      if (state.completedSteps.includes(action.payload)) {
        return state;
      }
      return { 
        ...state, 
        completedSteps: [...state.completedSteps, action.payload] 
      };
    
    case 'SET_CUSTOMER':
      return { ...state, customer: action.payload };
    
    case 'SET_SHIPPING':
      return { ...state, shipping: action.payload };
    
    case 'SET_PAYMENT':
      return { ...state, payment: action.payload };
    
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    
    case 'SET_SHIPPING_COST':
      return { ...state, shippingCost: action.payload };
    
    case 'SET_DISCOUNT':
      return { 
        ...state, 
        discount: action.payload.amount, 
        couponCode: action.payload.code 
      };
    
    case 'CLEAR_DISCOUNT':
      return { ...state, discount: 0, couponCode: null };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { 
        ...state, 
        errors: { ...state.errors, [action.payload.field]: action.payload.message } 
      };
    
    case 'CLEAR_ERRORS':
      return { ...state, errors: {} };
    
    case 'RESET_CHECKOUT':
      return initialState;
    
    default:
      return state;
  }
}

interface CheckoutContextType {
  state: CheckoutState;
  setStep: (step: CheckoutStep) => void;
  completeStep: (step: CheckoutStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  setCustomer: (customer: CustomerInfo) => void;
  setShipping: (shipping: ShippingAddress) => void;
  setPayment: (payment: PaymentInfo) => void;
  setProducts: (products: Product[]) => void;
  setShippingCost: (cost: number) => void;
  applyDiscount: (amount: number, code: string) => void;
  clearDiscount: () => void;
  setLoading: (loading: boolean) => void;
  setError: (field: string, message: string) => void;
  clearErrors: () => void;
  resetCheckout: () => void;
  subtotal: number;
  total: number;
  getCheckoutData: () => CheckoutData;
}

const CheckoutContext = createContext<CheckoutContextType | null>(null);

const STEPS_ORDER: CheckoutStep[] = ['customer', 'shipping', 'payment', 'review'];

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);

  const setStep = useCallback((step: CheckoutStep) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const completeStep = useCallback((step: CheckoutStep) => {
    dispatch({ type: 'COMPLETE_STEP', payload: step });
  }, []);

  const nextStep = useCallback(() => {
    const currentIndex = STEPS_ORDER.indexOf(state.currentStep);
    if (currentIndex < STEPS_ORDER.length - 1) {
      dispatch({ type: 'SET_STEP', payload: STEPS_ORDER[currentIndex + 1] });
    }
  }, [state.currentStep]);

  const prevStep = useCallback(() => {
    const currentIndex = STEPS_ORDER.indexOf(state.currentStep);
    if (currentIndex > 0) {
      dispatch({ type: 'SET_STEP', payload: STEPS_ORDER[currentIndex - 1] });
    }
  }, [state.currentStep]);

  const setCustomer = useCallback((customer: CustomerInfo) => {
    dispatch({ type: 'SET_CUSTOMER', payload: customer });
  }, []);

  const setShipping = useCallback((shipping: ShippingAddress) => {
    dispatch({ type: 'SET_SHIPPING', payload: shipping });
  }, []);

  const setPayment = useCallback((payment: PaymentInfo) => {
    dispatch({ type: 'SET_PAYMENT', payload: payment });
  }, []);

  const setProducts = useCallback((products: Product[]) => {
    dispatch({ type: 'SET_PRODUCTS', payload: products });
  }, []);

  const setShippingCost = useCallback((cost: number) => {
    dispatch({ type: 'SET_SHIPPING_COST', payload: cost });
  }, []);

  const applyDiscount = useCallback((amount: number, code: string) => {
    dispatch({ type: 'SET_DISCOUNT', payload: { amount, code } });
  }, []);

  const clearDiscount = useCallback(() => {
    dispatch({ type: 'CLEAR_DISCOUNT' });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((field: string, message: string) => {
    dispatch({ type: 'SET_ERROR', payload: { field, message } });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  const resetCheckout = useCallback(() => {
    dispatch({ type: 'RESET_CHECKOUT' });
  }, []);

  const subtotal = state.products.reduce(
    (sum, product) => sum + product.price * product.quantity, 
    0
  );

  const total = subtotal + state.shippingCost - state.discount;

  const getCheckoutData = useCallback((): CheckoutData => ({
    customer: state.customer,
    shipping: state.shipping,
    payment: state.payment,
    products: state.products,
    subtotal,
    shippingCost: state.shippingCost,
    discount: state.discount,
    total,
  }), [state, subtotal, total]);

  return (
    <CheckoutContext.Provider 
      value={{
        state,
        setStep,
        completeStep,
        nextStep,
        prevStep,
        setCustomer,
        setShipping,
        setPayment,
        setProducts,
        setShippingCost,
        applyDiscount,
        clearDiscount,
        setLoading,
        setError,
        clearErrors,
        resetCheckout,
        subtotal,
        total,
        getCheckoutData,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}
