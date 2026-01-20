'use client';

import { clsx } from 'clsx';
import { Check, User, MapPin, CreditCard, FileCheck } from 'lucide-react';
import { CheckoutStep } from '@/types/checkout';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useI18n } from '@/i18n';

interface StepInfo {
  id: CheckoutStep;
  labelKey: 'customer' | 'shipping' | 'payment' | 'review';
  icon: React.ReactNode;
}

const STEPS: StepInfo[] = [
  { id: 'customer', labelKey: 'customer', icon: <User size={18} /> },
  { id: 'shipping', labelKey: 'shipping', icon: <MapPin size={18} /> },
  { id: 'payment', labelKey: 'payment', icon: <CreditCard size={18} /> },
  { id: 'review', labelKey: 'review', icon: <FileCheck size={18} /> },
];

export function StepIndicator() {
  const { state, setStep } = useCheckout();
  const { t } = useI18n();
  const { currentStep, completedSteps } = state;

  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  const canNavigate = (stepId: CheckoutStep) => {
    const stepIndex = STEPS.findIndex(s => s.id === stepId);
    return completedSteps.includes(stepId) || stepIndex <= currentIndex;
  };

  return (
    <div className="w-full">
      {/* Desktop Version */}
      <div className="hidden sm:flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isClickable = canNavigate(step.id);

          return (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => isClickable && setStep(step.id)}
                disabled={!isClickable}
                className={clsx(
                  'flex items-center gap-2 group transition-all duration-200',
                  isClickable && 'cursor-pointer' ,
                  !isClickable && 'cursor-not-allowed opacity-50'
                )}
              >
                <div
                  className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                    isCompleted && 'bg-green-500 text-white',
                    isCurrent && !isCompleted && 'bg-indigo-600 text-white shadow-lg',
                    !isCurrent && !isCompleted && 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                  )}
                >
                  {isCompleted ? <Check size={18} strokeWidth={3} /> : step.icon}
                </div>
                <span
                  className={clsx(
                    'font-medium text-sm hidden lg:block transition-colors',
                    isCurrent && 'text-gray-900',
                    isCompleted && 'text-green-600',
                    !isCurrent && !isCompleted && 'text-gray-400'
                  )}
                >
                  {t.steps[step.labelKey]}
                </span>
              </button>
              
              {index < STEPS.length - 1 && (
                <div className="flex-1 mx-4">
                  <div className="h-0.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        'h-full bg-green-500 transition-all duration-500',
                        isCompleted ? 'w-full' : 'w-0'
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Version */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {STEPS.length}
          </span>
          <span className="text-sm font-medium text-gray-900">
            {t.steps[STEPS[currentIndex].labelKey]}
          </span>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;

            return (
              <div
                key={step.id}
                className={clsx(
                  'h-1.5 flex-1 rounded-full transition-all duration-300',
                  isCompleted && 'bg-green-500',
                  isCurrent && !isCompleted && 'bg-indigo-600',
                  !isCurrent && !isCompleted && 'bg-gray-200'
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
