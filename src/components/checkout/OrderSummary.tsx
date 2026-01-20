'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';
import { ShoppingBag, Tag, X, ChevronDown, ChevronUp, Truck, Shield, RotateCcw } from 'lucide-react';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useI18n } from '@/i18n';
import { formatCurrency, validateCoupon, getCartProducts } from '@/services/api';
import { checkoutConfig } from '@/config/checkout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function OrderSummary() {
  const { state, subtotal, total, setProducts, applyDiscount, clearDiscount, setLoading } = useCheckout();
  const { t } = useI18n();
  const { products, shippingCost, discount, couponCode, isLoading } = state;
  
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Carrega produtos mockados na inicialização
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const response = await getCartProducts();
      if (response.success && response.data) {
        setProducts(response.data);
      }
      setLoading(false);
    };
    
    if (products.length === 0) {
      loadProducts();
    }
  }, [products.length, setProducts, setLoading]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    
    setCouponError('');
    setCouponLoading(true);
    
    const response = await validateCoupon(couponInput);
    
    if (response.success && response.data) {
      const coupon = response.data;
      let discountAmount = 0;
      
      if (coupon.discountType === 'percentage') {
        discountAmount = subtotal * (coupon.discountValue / 100);
      } else {
        discountAmount = coupon.discountValue;
      }
      
      applyDiscount(discountAmount, coupon.code);
      setCouponInput('');
    } else {
      setCouponError(response.error || 'Cupom inválido');
    }
    
    setCouponLoading(false);
  };

  const handleRemoveCoupon = () => {
    clearDiscount();
    setCouponError('');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center justify-between bg-gray-50 lg:cursor-default"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
            <ShoppingBag size={18} />
          </div>
          <div className="text-left">
            <h2 className="font-semibold text-gray-900">{t.orderSummary.title}</h2>
            <p className="text-sm text-gray-500">{products.length} {products.length === 1 ? t.orderSummary.item : t.orderSummary.items}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg text-gray-900">{formatCurrency(total)}</span>
          <div className="lg:hidden text-gray-400">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </button>

      {/* Content */}
      <div className={clsx(
        'transition-all duration-300 overflow-hidden',
        isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 lg:max-h-[800px] lg:opacity-100'
      )}>
        {/* Products */}
        <div className="p-5 border-t border-gray-100 space-y-4 max-h-[280px] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="flex gap-3 group">
                <div className="relative w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingBag size={24} />
                    </div>
                  )}
                  {product.quantity > 1 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {product.quantity}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                  {product.description && (
                    <p className="text-xs text-gray-500 truncate">{product.description}</p>
                  )}
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {formatCurrency(product.price * product.quantity)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Coupon */}
        {checkoutConfig.features.enableCoupon && (
          <div className="p-5 border-t border-gray-100">
            {couponCode ? (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-700">{couponCode}</span>
                  <span className="text-sm text-green-600">(-{formatCurrency(discount)})</span>
                </div>
                <button 
                  onClick={handleRemoveCoupon}
                  className="text-green-600 hover:text-green-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder={t.orderSummary.couponPlaceholder}
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    leftIcon={<Tag size={16} />}
                    error={couponError}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleApplyCoupon}
                    isLoading={couponLoading}
                    className="px-4"
                  >
                    {t.orderSummary.applyCoupon}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Teste: WELCOME10, SAVE50, FREESHIP</p>
              </div>
            )}
          </div>
        )}

        {/* Totals */}
        <div className="p-5 border-t border-gray-100 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t.orderSummary.subtotal}</span>
            <span className="text-gray-900">{formatCurrency(subtotal)}</span>
          </div>
          {checkoutConfig.features.enableShipping && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t.orderSummary.shipping}</span>
              <span className={clsx(
                shippingCost === 0 ? 'text-green-600 font-medium' : 'text-gray-900'
              )}>
                {shippingCost === 0 ? t.orderSummary.freeShipping : formatCurrency(shippingCost)}
              </span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">{t.orderSummary.discount}</span>
              <span className="text-green-600 font-medium">-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">{t.orderSummary.total}</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</span>
                {checkoutConfig.features.enableInstallments && (
                  <p className="text-xs text-gray-500">
                    {checkoutConfig.installments.maxInstallments}x {formatCurrency(total / checkoutConfig.installments.maxInstallments)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        {checkoutConfig.ui.showOrderBenefits && (
          <div className="p-5 border-t border-gray-100 bg-gray-50">
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center mb-1.5">
                  <Shield size={14} className="text-green-600" />
                </div>
                <span className="text-xs text-gray-600 font-medium">{t.orderSummary.benefits.securePayment}</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center mb-1.5">
                  <Truck size={14} className="text-indigo-600" />
                </div>
                <span className="text-xs text-gray-600 font-medium">{t.orderSummary.benefits.freeShipping}</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center mb-1.5">
                  <RotateCcw size={14} className="text-purple-600" />
                </div>
                <span className="text-xs text-gray-600 font-medium">{t.orderSummary.benefits.easyReturn}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
