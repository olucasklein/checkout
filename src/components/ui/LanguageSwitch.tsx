'use client';

import { useI18n } from '@/i18n';
import { clsx } from 'clsx';

export function LanguageSwitch() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setLocale('pt')}
        className={clsx(
          'px-2 py-1 rounded-md text-xs font-medium transition-all duration-200',
          locale === 'pt'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        )}
        aria-label="Português"
      >
        PT
      </button>
      <button
        onClick={() => setLocale('en')}
        className={clsx(
          'px-2 py-1 rounded-md text-xs font-medium transition-all duration-200',
          locale === 'en'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        )}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
