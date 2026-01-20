'use client';

import { CheckoutProvider } from '@/contexts/CheckoutContext';
import { I18nProvider, useI18n } from '@/i18n';
import { CheckoutSteps, OrderSummary, StepIndicator } from '@/components/checkout';
import { LanguageSwitch } from '@/components/ui';
import { Lock, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

function CheckoutContent() {
  const { t } = useI18n();

  return (
    <CheckoutProvider>
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">{t.header.backToStore}</span>
              </Link>
              
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-indigo-600">
                  {t.header.checkout}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <LanguageSwitch />
                <div className="w-[155px] hidden sm:flex items-center gap-1.5 text-gray-500 text-sm">
                  <Lock size={14} />
                  <span>{t.header.secureEnvironment}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Step Indicator */}
          <div className="mb-8">
            <StepIndicator />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-7 xl:col-span-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 animate-fade-in">
                <CheckoutSteps />
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="lg:sticky lg:top-24">
                <OrderSummary />
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-100 mt-16 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <a href="#" className="hover:text-gray-900 transition-colors">{t.footer.privacyPolicy}</a>
                <a href="#" className="hover:text-gray-900 transition-colors">{t.footer.termsOfUse}</a>
                <a href="#" className="hover:text-gray-900 transition-colors">{t.footer.faq}</a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">{t.footer.securePaymentVia}</span>
                <div className="flex items-center gap-2">
                  <Image
                    src="https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat/visa.svg"
                    alt="Visa"
                    width={40}
                    height={24}
                    className="object-contain rounded"
                  />
                  <Image
                    src="https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat/mastercard.svg"
                    alt="Mastercard"
                    width={40}
                    height={24}
                    className="object-contain rounded"
                  />
                  <div className="w-[40px] h-[26px] px-2 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600">PIX</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center text-sm text-gray-400">
              © {new Date().getFullYear()} Lucas Klein. {t.footer.allRightsReserved}
            </div>
          </div>
        </footer>
      </div>
    </CheckoutProvider>
  );
}

export default function CheckoutPage() {
  return (
    <I18nProvider>
      <CheckoutContent />
    </I18nProvider>
  );
}
