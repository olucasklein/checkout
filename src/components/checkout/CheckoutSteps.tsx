'use client';

import { useCheckout } from '@/contexts/CheckoutContext';
import { CustomerForm } from './CustomerForm';
import { ShippingForm } from './ShippingForm';
import { PaymentForm } from './PaymentForm';
import { ReviewOrder } from './ReviewOrder';

export function CheckoutSteps() {
  const { state } = useCheckout();
  const { currentStep } = state;

  return (
    <div className="min-h-[400px]">
      {currentStep === 'customer' && <CustomerForm />}
      {currentStep === 'shipping' && <ShippingForm />}
      {currentStep === 'payment' && <PaymentForm />}
      {currentStep === 'review' && <ReviewOrder />}
    </div>
  );
}
