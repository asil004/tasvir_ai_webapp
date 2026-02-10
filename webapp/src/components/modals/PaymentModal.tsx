'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { formatNumber } from '@/utils/helpers';
import { isInvoiceSupported, getTelegramWebApp } from '@/utils/telegram';

interface PaymentModalProps {
  onSelectPayment: (method: 'stars' | 'uzs') => void;
  onBack: () => void;
  loading?: boolean;
}

export default function PaymentModal({ onSelectPayment, onBack, loading = false }: PaymentModalProps) {
  const { priceStars, priceUzs } = useAppSelector((state) => state.subscription);
  const [selectedMethod, setSelectedMethod] = useState<'stars' | 'uzs' | null>(null);
  const [starsSupported, setStarsSupported] = useState(true);
  const [telegramVersion, setTelegramVersion] = useState('');

  useEffect(() => {
    const supported = isInvoiceSupported();
    setStarsSupported(supported);

    const tg = getTelegramWebApp();
    if (tg) {
      setTelegramVersion(tg.version || '6.0');
    }
  }, []);

  const handleSelect = (method: 'stars' | 'uzs') => {
    if (method === 'stars' && !starsSupported) {
      return; // Disabled
    }
    setSelectedMethod(method);
    onSelectPayment(method);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="font-mono font-bold text-xl sm:text-2xl mb-1">To'lov usulini tanlang</h3>
        <p className="text-secondary-text text-xs sm:text-sm">
          Bu shablon pullik. To'lovni amalga oshiring va rasm yaratishni boshlang
        </p>
      </div>

      <div className="space-y-3">
        {/* Telegram Stars */}
        {priceStars && priceStars > 0 && (
          <button
            onClick={() => handleSelect('stars')}
            disabled={loading || !starsSupported}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              selectedMethod === 'stars'
                ? 'border-accent bg-accent/10'
                : 'border-border hover:border-accent'
            } ${loading || !starsSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-2xl">
                  ⭐
                </div>
                <div>
                  <p className="font-mono font-bold text-base sm:text-lg">Telegram Stars</p>
                  <p className="text-secondary-text text-xs">Telegram orqali to'lash</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-lg sm:text-xl text-accent">
                  {priceStars} ⭐
                </p>
                <p className="text-secondary-text text-xs">
                  {starsSupported ? 'Tezkor' : `v${telegramVersion} - Yangilang`}
                </p>
              </div>
            </div>
            {!starsSupported && (
              <p className="text-xs text-red-500 mt-2 px-2">
                ⚠️ Telegram v6.1+ talab qilinadi. Iltimos, ilovani yangilang yoki Click orqali to'lang.
              </p>
            )}
          </button>
        )}

        {/* Click Payment */}
        {priceUzs && priceUzs > 0 && (
          <button
            onClick={() => handleSelect('uzs')}
            disabled={loading}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              selectedMethod === 'uzs'
                ? 'border-accent bg-accent/10'
                : 'border-border hover:border-accent'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Click Logo SVG */}
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 shadow-sm">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <defs>
                      <linearGradient id="clickGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#00AEEF', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#0072BC', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <circle cx="100" cy="100" r="90" fill="url(#clickGradient)" />
                    <text
                      x="100"
                      y="125"
                      fontSize="80"
                      fontWeight="bold"
                      fill="white"
                      textAnchor="middle"
                      fontFamily="Arial, sans-serif"
                    >
                      C
                    </text>
                  </svg>
                </div>
                <div>
                  <p className="font-mono font-bold text-base sm:text-lg">Click</p>
                  <p className="text-secondary-text text-xs">Click app orqali</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-lg sm:text-xl text-accent">
                  {formatNumber(priceUzs)} so'm
                </p>
                <p className="text-secondary-text text-xs">Tez to'lov</p>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Info Box */}
      <div className="relative overflow-hidden rounded-xl border-2 border-accent bg-gradient-to-br from-accent to-[#00dd77] p-[2px]">
        <div className="bg-card rounded-lg p-4 relative">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#0a0a0a]" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-mono font-bold text-sm mb-1 text-accent">Xavfsiz to'lov</h4>
              <p className="text-xs leading-relaxed">
                Barcha to'lovlar xavfsiz tizimlar orqali amalga oshiriladi. To'lovdan so'ng darhol
                rasm generatsiya qilinadi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-2">
          <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-secondary-text mt-2">To'lov oynasi ochilmoqda...</p>
        </div>
      )}

      <button
        onClick={onBack}
        disabled={loading}
        className="btn-secondary w-full py-2 rounded-lg font-mono text-xs border-2 border-border hover:border-accent hover:bg-accent hover:text-[#0a0a0a] transition-all disabled:opacity-50"
      >
        Orqaga
      </button>
    </div>
  );
}
