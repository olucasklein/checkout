'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, CreditCard, MapPin, User, Pencil, Lock, Loader2, PartyPopper } from 'lucide-react';
import { useCheckout } from '@/contexts/CheckoutContext';
import { Button } from '@/components/ui/Button';
import { formatCurrency, processPayment } from '@/services/api';
import { clsx } from 'clsx';

export function ReviewOrder() {
  const router = useRouter();
  const { state, prevStep, setStep, getCheckoutData, total, subtotal, resetCheckout } = useCheckout();
  const { customer, shipping, payment, products, shippingCost, discount } = state;
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const checkoutData = getCheckoutData();
      const response = await processPayment(checkoutData);
      
      if (response.success && response.data) {
        setOrderId(response.data.orderId);
        setOrderComplete(true);
      } else {
        setError(response.error || 'Erro ao processar pagamento');
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    }
    
    setIsProcessing(false);
  };

  const handleNewOrder = () => {
    resetCheckout();
    router.push('/');
  };

  if (orderComplete) {
    return (
      <div className="text-center py-12 space-y-6">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mx-auto shadow-lg animate-bounce">
            <PartyPopper size={40} className="text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center animate-pulse">
            <Check size={16} className="text-yellow-800" strokeWidth={3} />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Pedido confirmado! 🎉</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Seu pedido <span className="font-semibold text-indigo-600">{orderId}</span> foi 
            realizado com sucesso. Enviamos os detalhes para {customer.email}
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 max-w-sm mx-auto">
          <p className="text-sm text-gray-500 mb-2">Total pago</p>
          <p className="text-4xl font-bold text-gray-900">{formatCurrency(total)}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button variant="outline" onClick={() => router.push('/')}>
            Voltar à loja
          </Button>
          <Button onClick={handleNewOrder}>
            Fazer novo pedido
          </Button>
        </div>
      </div>
    );
  }

  const paymentMethodLabel = {
    credit: 'Cartão de Crédito',
    debit: 'Cartão de Débito',
    pix: 'Pix',
    boleto: 'Boleto',
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900">Revise seu pedido</h2>
        <p className="text-gray-500">Confira os dados antes de finalizar</p>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <User size={18} className="text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Dados pessoais</h3>
          </div>
          <button 
            onClick={() => setStep('customer')}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <Pencil size={14} />
            Editar
          </button>
        </div>
        <div className="p-4 space-y-1">
          <p className="font-medium text-gray-900">{customer.firstName} {customer.lastName}</p>
          <p className="text-sm text-gray-600">{customer.email}</p>
          <p className="text-sm text-gray-600">{customer.phone}</p>
        </div>
      </div>

      {/* Shipping Info */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <MapPin size={18} className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Endereço de entrega</h3>
          </div>
          <button 
            onClick={() => setStep('shipping')}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <Pencil size={14} />
            Editar
          </button>
        </div>
        <div className="p-4 space-y-1">
          <p className="font-medium text-gray-900">
            {shipping.street}, {shipping.number}
            {shipping.complement && ` - ${shipping.complement}`}
          </p>
          <p className="text-sm text-gray-600">
            {shipping.neighborhood} - {shipping.city}/{shipping.state}
          </p>
          <p className="text-sm text-gray-600">CEP: {shipping.zipCode}</p>
        </div>
      </div>

      {/* Payment Info */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CreditCard size={18} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Pagamento</h3>
          </div>
          <button 
            onClick={() => setStep('payment')}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <Pencil size={14} />
            Editar
          </button>
        </div>
        <div className="p-4 space-y-1">
          <p className="font-medium text-gray-900">{paymentMethodLabel[payment.method]}</p>
          {(payment.method === 'credit' || payment.method === 'debit') && payment.cardNumber && (
            <>
              <p className="text-sm text-gray-600">
                •••• •••• •••• {payment.cardNumber.slice(-4)}
              </p>
              {payment.method === 'credit' && payment.installments && (
                <p className="text-sm text-gray-600">
                  {payment.installments}x de {formatCurrency(total / payment.installments)} sem juros
                </p>
              )}
            </>
          )}
          {payment.method === 'pix' && (
            <p className="text-sm text-green-600 font-medium">
              10% de desconto • Total: {formatCurrency(total * 0.9)}
            </p>
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal ({products.length} itens)</span>
          <span className="text-gray-900">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Frete</span>
          <span className="text-gray-900">{formatCurrency(shippingCost)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Desconto</span>
            <span className="text-green-600">-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(payment.method === 'pix' ? total * 0.9 : total)}
            </span>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button 
          type="button"
          variant="outline"
          onClick={prevStep}
          leftIcon={<ArrowLeft size={20} />}
          className="w-full sm:w-auto"
          disabled={isProcessing}
        >
          Voltar
        </Button>
        <Button 
          onClick={handleSubmit}
          size="lg"
          className="w-full sm:flex-1"
          isLoading={isProcessing}
          leftIcon={!isProcessing ? <Lock size={18} /> : undefined}
        >
          {isProcessing ? 'Processando...' : 'Finalizar compra'}
        </Button>
      </div>

      {/* Security badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-2">
        <Lock size={14} />
        <span>Pagamento 100% seguro com criptografia SSL</span>
      </div>
    </div>
  );
}
