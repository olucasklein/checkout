'use client';

import { useState, FormEvent } from 'react';
import { CreditCard, Calendar, Lock, ArrowRight, ArrowLeft, Check, Smartphone, Barcode } from 'lucide-react';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useI18n } from '@/i18n';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatCardNumber, formatExpiryDate, validateCardNumber, getCardBrand, formatCurrency } from '@/services/api';
import { checkoutConfig } from '@/config/checkout';
import { clsx } from 'clsx';
import Image from 'next/image';

type PaymentMethod = 'credit' | 'debit' | 'pix' | 'boleto';

interface PaymentMethodOption {
  id: PaymentMethod;
  labelKey: 'credit' | 'debit' | 'pix' | 'boleto';
  descKey: 'creditDesc' | 'debitDesc' | 'pixDesc' | 'boletoDesc';
  icon: React.ReactNode;
}

const ALL_PAYMENT_METHODS: PaymentMethodOption[] = [
  { id: 'credit', labelKey: 'credit', descKey: 'creditDesc', icon: <CreditCard size={20} /> },
  { id: 'debit', labelKey: 'debit', descKey: 'debitDesc', icon: <CreditCard size={20} /> },
  { id: 'pix', labelKey: 'pix', descKey: 'pixDesc', icon: <Smartphone size={20} /> },
  { id: 'boleto', labelKey: 'boleto', descKey: 'boletoDesc', icon: <Barcode size={20} /> },
];

const CARD_BRAND_LOGOS: Record<string, string> = {
  visa: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat/visa.svg',
  mastercard: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat/mastercard.svg',
  amex: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat/amex.svg',
  elo: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat/elo.svg',
  hipercard: 'https://seeklogo.com/images/H/hipercard-logo-1E4F37F258-seeklogo.com.png',
};

export function PaymentForm() {
  const { state, setPayment, prevStep, nextStep, completeStep, total } = useCheckout();
  const { t } = useI18n();
  const [formData, setFormData] = useState(state.payment);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [cardBrand, setCardBrand] = useState('generic');
  const [isFlipped, setIsFlipped] = useState(false);

  const isCardMethod = formData.method === 'credit' || formData.method === 'debit';

  // Filter payment methods based on config
  const PAYMENT_METHODS = ALL_PAYMENT_METHODS.filter(
    method => checkoutConfig.paymentMethods[method.id]
  );

  const validateField = (name: string, value: string) => {
    if (!isCardMethod && name !== 'method') return '';
    
    switch (name) {
      case 'cardNumber':
        const cleanNumber = value.replace(/\D/g, '');
        if (!cleanNumber) return t.paymentForm.errors.cardNumberRequired;
        if (!validateCardNumber(cleanNumber)) return t.paymentForm.errors.cardNumberInvalid;
        break;
      case 'cardName':
        if (!value.trim()) return t.paymentForm.errors.cardNameRequired;
        if (value.trim().length < 3) return t.paymentForm.errors.cardNameMin;
        break;
      case 'expiryDate':
        if (!value) return t.paymentForm.errors.expiryRequired;
        const [month, year] = value.split('/');
        const monthNum = parseInt(month);
        if (monthNum < 1 || monthNum > 12) return t.paymentForm.errors.expiryInvalidMonth;
        const currentYear = new Date().getFullYear() % 100;
        const yearNum = parseInt(year);
        if (yearNum < currentYear) return t.paymentForm.errors.expiryExpired;
        break;
      case 'cvv':
        if (!value) return t.paymentForm.errors.cvvRequired;
        if (value.length < 3) return t.paymentForm.errors.cvvInvalid;
        break;
    }
    return '';
  };

  const handleChange = (name: string, value: string) => {
    let formattedValue = value;
    
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      setCardBrand(getCardBrand(value));
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (name === 'cardName') {
      formattedValue = value.toUpperCase();
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, formattedValue) }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, formData[name as keyof typeof formData] as string || '') }));
  };

  const handleMethodChange = (method: PaymentMethod) => {
    setFormData(prev => ({ ...prev, method }));
    setErrors({});
    setTouched({});
  };

  const validateForm = () => {
    if (!isCardMethod) return true;
    
    const newErrors: Record<string, string> = {};
    const fieldsToValidate = ['cardNumber', 'cardName', 'expiryDate', 'cvv'];
    
    fieldsToValidate.forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData] as string || '');
      if (error) newErrors[key] = error;
    });
    
    setErrors(newErrors);
    setTouched({
      cardNumber: true,
      cardName: true,
      expiryDate: true,
      cvv: true,
    });
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setPayment(formData);
      completeStep('payment');
      nextStep();
    }
  };

  // Calcula parcelas
  const installmentOptions = Array.from({ length: checkoutConfig.installments.maxInstallments }, (_, i) => {
    const installmentNumber = i + 1;
    const installmentValue = total / installmentNumber;
    if (installmentValue < checkoutConfig.installments.minInstallmentValue && installmentNumber > 1) {
      return null;
    }
    return {
      value: installmentNumber,
      label: installmentNumber === 1 
        ? `1x ${formatCurrency(installmentValue)} (${t.paymentForm.installmentSingle})`
        : `${installmentNumber}x ${formatCurrency(installmentValue)} ${t.paymentForm.installmentMultiple}`,
    };
  }).filter(Boolean) as { value: number; label: string }[];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900">{t.paymentForm.title}</h2>
        <p className="text-gray-500">{t.paymentForm.subtitle}</p>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {t.paymentForm.paymentMethod}
        </label>
        <div className={clsx(
          'grid gap-3',
          PAYMENT_METHODS.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'
        )}>
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => handleMethodChange(method.id)}
              className={clsx(
                'p-4 rounded-xl border-2 transition-all duration-200 text-left',
                'hover:border-indigo-300 hover:bg-indigo-50/50',
                formData.method === method.id
                  ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                  : 'border-gray-200 bg-white'
              )}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className={clsx(
                  'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                  formData.method === method.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-500'
                )}>
                  {method.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{t.paymentForm[method.labelKey]}</p>
                  <p className="text-xs text-gray-500 hidden sm:block">{t.paymentForm[method.descKey]}</p>
                </div>
                {formData.method === method.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Card Form */}
      {isCardMethod && (
        <div className="space-y-4 p-5 bg-gray-50 rounded-2xl">
          {/* Card Preview - Flip Card */}
          <div 
            className="relative aspect-[1.586/1] max-w-sm mx-auto cursor-pointer"
            style={{ perspective: '1000px' }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div 
              className="relative w-full h-full transition-transform duration-700"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Card Front */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl shadow-xl overflow-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {/* Card Chip */}
                <div className="absolute top-6 left-6 w-12 h-9 bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400 rounded-md" />
                
                {/* Contactless */}
                <div className="absolute top-6 left-20 text-white/50">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7.5 7.5c3.5-3.5 9-3.5 9 0" />
                    <path d="M5 5c5-5 14-5 14 0" />
                    <path d="M10 10c1.5-1.5 3.5-1.5 3.5 0" />
                  </svg>
                </div>

                {/* Card Number */}
                <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2">
                  <p className="text-white text-lg sm:text-xl font-mono tracking-[0.2em]">
                    {formData.cardNumber || '•••• •••• •••• ••••'}
                  </p>
                </div>

                {/* Card Info */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <div>
                    <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">{t.paymentForm.holder}</p>
                    <p className="text-white text-sm font-medium truncate max-w-[180px]">
                      {formData.cardName || t.paymentForm.yourNameHere}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">{t.paymentForm.validity}</p>
                    <p className="text-white text-sm font-medium">
                      {formData.expiryDate || 'MM/AA'}
                    </p>
                  </div>
                </div>

                {/* Card Brand */}
                {cardBrand !== 'generic' && CARD_BRAND_LOGOS[cardBrand] && (
                  <div className="absolute top-6 right-6 rounded">
                    <Image
                      src={CARD_BRAND_LOGOS[cardBrand]}
                      alt={cardBrand}
                      width={48}
                      height={32}
                      className="object-contain rounded"
                    />
                  </div>
                )}
              </div>

              {/* Card Back */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl shadow-xl overflow-hidden"
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                {/* Magnetic Stripe */}
                <div className="absolute top-8 left-0 right-0 h-12 bg-black" />
                
                {/* Signature Strip & CVV */}
                <div className="absolute top-24 left-6 right-6">
                  <div className="bg-white/90 rounded p-3 flex justify-between items-center">
                    <div className="flex-1 border-r border-gray-300 pr-3">
                      <div className="h-6 italic text-gray-600 text-sm flex items-center">
                        {formData.cardName ? formData.cardName.slice(0, 20) : 'Assinatura'}
                      </div>
                    </div>
                    <div className="pl-3 text-right">
                      <p className="text-[10px] text-gray-500 mb-1">CVV</p>
                      <p className="text-base font-bold text-gray-900 font-mono">
                        {formData.cvv || '•••'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Brand on Back */}
                {cardBrand !== 'generic' && CARD_BRAND_LOGOS[cardBrand] && (
                  <div className="absolute bottom-6 right-6 rounded">
                    <Image
                      src={CARD_BRAND_LOGOS[cardBrand]}
                      alt={cardBrand}
                      width={48}
                      height={32}
                      className="object-contain rounded"
                    />
                  </div>
                )}

                {/* Security Note */}
                <div className="absolute bottom-6 left-6 text-white/50 text-[10px] max-w-[200px]">
                  <p>Este cartão é propriedade do banco emissor e deve ser devolvido mediante solicitação.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Hint to flip */}
          <p className="text-center text-xs text-gray-500 mt-2">
            {t.paymentForm.clickToFlip}
          </p>

          {/* Card Inputs */}
          <div className="space-y-4 pt-4">
            <Input
              label={t.paymentForm.cardNumber}
              placeholder="0000 0000 0000 0000"
              value={formData.cardNumber || ''}
              onChange={(e) => handleChange('cardNumber', e.target.value)}
              onBlur={() => handleBlur('cardNumber')}
              error={touched.cardNumber ? errors.cardNumber : undefined}
              leftIcon={<CreditCard size={18} />}
              autoComplete="cc-number"
              maxLength={19}
            />

            <Input
              label={t.paymentForm.cardName}
              placeholder={t.paymentForm.cardNamePlaceholder}
              value={formData.cardName || ''}
              onChange={(e) => handleChange('cardName', e.target.value)}
              onBlur={() => handleBlur('cardName')}
              error={touched.cardName ? errors.cardName : undefined}
              autoComplete="cc-name"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t.paymentForm.expiryDate}
                placeholder="MM/AA"
                value={formData.expiryDate || ''}
                onChange={(e) => handleChange('expiryDate', e.target.value)}
                onBlur={() => handleBlur('expiryDate')}
                error={touched.expiryDate ? errors.expiryDate : undefined}
                leftIcon={<Calendar size={18} />}
                autoComplete="cc-exp"
                maxLength={5}
              />
              <Input
                label={t.paymentForm.cvv}
                placeholder="000"
                type="password"
                value={formData.cvv || ''}
                onChange={(e) => handleChange('cvv', e.target.value)}
                onBlur={() => handleBlur('cvv')}
                error={touched.cvv ? errors.cvv : undefined}
                leftIcon={<Lock size={18} />}
                autoComplete="cc-csc"
                maxLength={4}
              />
            </div>

            {/* Installments */}
            {formData.method === 'credit' && checkoutConfig.features.enableInstallments && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t.paymentForm.installments}
                </label>
                <select
                  value={formData.installments || 1}
                  onChange={(e) => setFormData(prev => ({ ...prev, installments: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
                >
                  {installmentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PIX Info */}
      {formData.method === 'pix' && (
        <div className="p-5 bg-green-50 rounded-2xl border border-green-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <Smartphone size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">
                {checkoutConfig.pixDiscount.percentage}% {t.paymentForm.pixDiscount}
              </h3>
              <p className="text-sm text-green-700 mt-1">
                {t.paymentForm.pixInstructions}
              </p>
              {checkoutConfig.pixDiscount.enabled && (
                <div className="mt-3 p-3 bg-white rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(total * (1 - checkoutConfig.pixDiscount.percentage / 100))}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Boleto Info */}
      {formData.method === 'boleto' && (
        <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Barcode size={24} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800">{t.paymentForm.boleto}</h3>
              <p className="text-sm text-amber-700 mt-1">
                {t.paymentForm.boletoInstructions}
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-amber-600">
                <Calendar size={16} />
                <span>{t.paymentForm.boletoWarning}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button 
          type="button"
          variant="outline"
          onClick={prevStep}
          leftIcon={<ArrowLeft size={20} />}
          className="w-full sm:w-auto"
        >
          {t.paymentForm.back}
        </Button>
        <Button 
          type="submit" 
          size="lg"
          rightIcon={<ArrowRight size={20} />}
          className="w-full sm:flex-1"
        >
          {t.paymentForm.continue}
        </Button>
      </div>
    </form>
  );
}
