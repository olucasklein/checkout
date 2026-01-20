'use client';

import { useState, FormEvent } from 'react';
import { Mail, Phone, User, ArrowRight } from 'lucide-react';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useI18n } from '@/i18n';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatPhone } from '@/services/api';

export function CustomerForm() {
  const { state, setCustomer, nextStep, completeStep } = useCheckout();
  const { t } = useI18n();
  const [formData, setFormData] = useState(state.customer);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return t.customerForm.errors.firstNameRequired;
        if (value.trim().length < 2) return t.customerForm.errors.firstNameMin;
        break;
      case 'lastName':
        if (!value.trim()) return t.customerForm.errors.lastNameRequired;
        if (value.trim().length < 2) return t.customerForm.errors.lastNameMin;
        break;
      case 'email':
        if (!value.trim()) return t.customerForm.errors.emailRequired;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t.customerForm.errors.emailInvalid;
        break;
      case 'phone':
        const cleanPhone = value.replace(/\D/g, '');
        if (!cleanPhone) return t.customerForm.errors.phoneRequired;
        if (cleanPhone.length < 10 || cleanPhone.length > 11) return t.customerForm.errors.phoneInvalid;
        break;
    }
    return '';
  };

  const handleChange = (name: string, value: string) => {
    let formattedValue = value;
    
    if (name === 'phone') {
      formattedValue = formatPhone(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, formattedValue) }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, formData[name as keyof typeof formData]) }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });
    
    setErrors(newErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    });
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setCustomer(formData);
      completeStep('customer');
      nextStep();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900">{t.customerForm.title}</h2>
        <p className="text-gray-500">{t.customerForm.subtitle}</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t.customerForm.firstName}
            placeholder="João"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            error={touched.firstName ? errors.firstName : undefined}
            leftIcon={<User size={18} />}
            autoComplete="given-name"
          />
          <Input
            label={t.customerForm.lastName}
            placeholder="Silva"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            error={touched.lastName ? errors.lastName : undefined}
            autoComplete="family-name"
          />
        </div>

        <Input
          label={t.customerForm.email}
          type="email"
          placeholder="joao@exemplo.com"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          error={touched.email ? errors.email : undefined}
          leftIcon={<Mail size={18} />}
          autoComplete="email"
        />

        <Input
          label={t.customerForm.phone}
          type="tel"
          placeholder="(11) 99999-9999"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          onBlur={() => handleBlur('phone')}
          error={touched.phone ? errors.phone : undefined}
          leftIcon={<Phone size={18} />}
          autoComplete="tel"
          maxLength={15}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          size="lg"
          rightIcon={<ArrowRight size={20} />}
          className="w-full sm:w-auto"
        >
          {t.customerForm.continue}
        </Button>
      </div>
    </form>
  );
}
