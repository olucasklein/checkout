'use client';

import { useState, FormEvent, useEffect } from 'react';
import { MapPin, Home, ArrowRight, ArrowLeft, Loader2, Truck, Check } from 'lucide-react';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useI18n } from '@/i18n';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatZipCode, fetchAddressByZipCode, calculateShipping, formatCurrency, ShippingOption } from '@/services/api';
import { checkoutConfig } from '@/config/checkout';
import { clsx } from 'clsx';

export function ShippingForm() {
  const { state, setShipping, setShippingCost, prevStep, nextStep, completeStep } = useCheckout();
  const { t } = useI18n();
  const [formData, setFormData] = useState(state.shipping);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoadingZip, setIsLoadingZip] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'zipCode':
        const cleanZip = value.replace(/\D/g, '');
        if (!cleanZip) return t.shippingForm.errors.zipCodeRequired;
        if (cleanZip.length !== 8) return t.shippingForm.errors.zipCodeInvalid;
        break;
      case 'street':
        if (!value.trim()) return t.shippingForm.errors.streetRequired;
        break;
      case 'number':
        if (!value.trim()) return t.shippingForm.errors.numberRequired;
        break;
      case 'neighborhood':
        if (!value.trim()) return t.shippingForm.errors.neighborhoodRequired;
        break;
      case 'city':
        if (!value.trim()) return t.shippingForm.errors.cityRequired;
        break;
      case 'state':
        if (!value.trim()) return t.shippingForm.errors.stateRequired;
        break;
    }
    return '';
  };

  const handleChange = (name: string, value: string) => {
    let formattedValue = value;
    
    if (name === 'zipCode') {
      formattedValue = formatZipCode(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, formattedValue) }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, formData[name as keyof typeof formData] || '') }));
  };

  // Busca automática de endereço pelo CEP
  useEffect(() => {
    const cleanZip = formData.zipCode.replace(/\D/g, '');
    
    if (cleanZip.length === 8) {
      const fetchAddress = async () => {
        setIsLoadingZip(true);
        const response = await fetchAddressByZipCode(cleanZip);
        
        if (response.success && response.data) {
          setFormData(prev => ({
            ...prev,
            street: response.data!.street || prev.street,
            neighborhood: response.data!.neighborhood || prev.neighborhood,
            city: response.data!.city || prev.city,
            state: response.data!.state || prev.state,
          }));
        }
        setIsLoadingZip(false);
        
        // Calcula opções de frete
        setIsLoadingShipping(true);
        const shippingResponse = await calculateShipping(cleanZip);
        if (shippingResponse.success && shippingResponse.data) {
          setShippingOptions(shippingResponse.data);
        }
        setIsLoadingShipping(false);
      };
      
      fetchAddress();
    } else {
      setShippingOptions([]);
      setSelectedShipping(null);
    }
  }, [formData.zipCode]);

  const handleSelectShipping = (option: ShippingOption) => {
    setSelectedShipping(option.id);
    setShippingCost(option.price);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const fieldsToValidate = ['zipCode', 'street', 'number', 'neighborhood', 'city', 'state'];
    
    fieldsToValidate.forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData] || '');
      if (error) newErrors[key] = error;
    });
    
    if (checkoutConfig.features.enableShipping && !selectedShipping) {
      newErrors.shipping = t.shippingForm.errors.shippingRequired;
    }
    
    setErrors(newErrors);
    setTouched(prev => {
      const allTouched: Record<string, boolean> = { ...prev };
      fieldsToValidate.forEach(key => { allTouched[key] = true; });
      return allTouched;
    });
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setShipping(formData);
      completeStep('shipping');
      nextStep();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900">{t.shippingForm.title}</h2>
        <p className="text-gray-500">{t.shippingForm.subtitle}</p>
      </div>

      <div className="space-y-4">
        {/* CEP */}
        <div className="relative">
          <Input
            label={t.shippingForm.zipCode}
            placeholder="00000-000"
            value={formData.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            onBlur={() => handleBlur('zipCode')}
            error={touched.zipCode ? errors.zipCode : undefined}
            leftIcon={<MapPin size={18} />}
            rightIcon={isLoadingZip ? <Loader2 size={18} className="animate-spin" /> : undefined}
            autoComplete="postal-code"
            maxLength={9}
          />
          <a
            href="https://buscacepinter.correios.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-0 top-0 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Não sei meu CEP
          </a>
        </div>

        {/* Street + Number */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              label={t.shippingForm.street}
              placeholder="Nome da rua"
              value={formData.street}
              onChange={(e) => handleChange('street', e.target.value)}
              onBlur={() => handleBlur('street')}
              error={touched.street ? errors.street : undefined}
              leftIcon={<Home size={18} />}
              autoComplete="street-address"
            />
          </div>
          <Input
            label={t.shippingForm.number}
            placeholder="123"
            value={formData.number}
            onChange={(e) => handleChange('number', e.target.value)}
            onBlur={() => handleBlur('number')}
            error={touched.number ? errors.number : undefined}
          />
        </div>

        {/* Complement */}
        <Input
          label={t.shippingForm.complement}
          placeholder={t.shippingForm.complementPlaceholder}
          value={formData.complement || ''}
          onChange={(e) => handleChange('complement', e.target.value)}
        />

        {/* Neighborhood + City + State */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label={t.shippingForm.neighborhood}
            placeholder="Seu bairro"
            value={formData.neighborhood}
            onChange={(e) => handleChange('neighborhood', e.target.value)}
            onBlur={() => handleBlur('neighborhood')}
            error={touched.neighborhood ? errors.neighborhood : undefined}
          />
          <Input
            label={t.shippingForm.city}
            placeholder="Sua cidade"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            onBlur={() => handleBlur('city')}
            error={touched.city ? errors.city : undefined}
          />
          <Input
            label={t.shippingForm.state}
            placeholder="UF"
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
            onBlur={() => handleBlur('state')}
            error={touched.state ? errors.state : undefined}
            maxLength={2}
          />
        </div>

        {/* Shipping Options */}
        {checkoutConfig.features.enableShipping && shippingOptions.length > 0 && (
          <div className="space-y-3 pt-4">
            <label className="block text-sm font-medium text-gray-700">
              {t.shippingForm.shippingOptions}
            </label>
            <div className="space-y-2">
              {shippingOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelectShipping(option)}
                  className={clsx(
                    'w-full p-4 rounded-xl border-2 transition-all duration-200 text-left',
                    'hover:border-indigo-300 hover:bg-indigo-50/50',
                    selectedShipping === option.id
                      ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                      : 'border-gray-200 bg-white'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                        selectedShipping === option.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-500'
                      )}>
                        <Truck size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{option.name}</p>
                        <p className="text-sm text-gray-500">
                          {option.estimatedDays === 0 
                            ? t.shippingForm.deliveryToday
                            : `${option.estimatedDays} ${t.shippingForm.deliveryDays}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">{formatCurrency(option.price)}</span>
                      {selectedShipping === option.id && (
                        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                          <Check size={14} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {errors.shipping && (
              <p className="text-sm text-red-600">{errors.shipping}</p>
            )}
          </div>
        )}

        {isLoadingShipping && (
          <div className="flex items-center justify-center gap-2 py-4 text-gray-500">
            <Loader2 size={20} className="animate-spin" />
            <span>{t.shippingForm.searching}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button 
          type="button"
          variant="outline"
          onClick={prevStep}
          leftIcon={<ArrowLeft size={20} />}
          className="w-full sm:w-auto"
        >
          {t.shippingForm.back}
        </Button>
        <Button 
          type="submit" 
          size="lg"
          rightIcon={<ArrowRight size={20} />}
          className="w-full sm:flex-1"
          disabled={checkoutConfig.features.enableShipping && !selectedShipping}
        >
          {t.shippingForm.continue}
        </Button>
      </div>
    </form>
  );
}
