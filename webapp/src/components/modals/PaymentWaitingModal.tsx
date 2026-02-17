'use client';

import React from 'react';

interface PaymentWaitingModalProps {
  paymentMethod: 'stars' | 'click' | 'tg_payments';
  onCheckPayment: () => void;  // Click uchun - faqat status tekshiradi
  onCancel: () => void;
  loading?: boolean;
}

export default function PaymentWaitingModal({
  paymentMethod,
  onCheckPayment,
  onCancel,
  loading = false,
}: PaymentWaitingModalProps) {
  // Stars yoki tg_payments uchun - avtomatik callback, faqat loading ko'rsatamiz
  if (paymentMethod === 'stars' || paymentMethod === 'tg_payments') {
    return (
      <div className="space-y-4 py-4">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto text-6xl">⭐</div>
          <div className="space-y-1">
            <h3 className="font-mono font-bold text-lg sm:text-xl">
              Stars to'lov kutilmoqda...
            </h3>
            <p className="text-secondary-text text-xs sm:text-sm">
              Telegram to'lov oynasida to'lovni amalga oshiring
            </p>
          </div>
        </div>

        <div className="text-center py-4">
          <div className="inline-block w-12 h-12 border-3 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-secondary-text mt-3">To'lov tasdiqlanishi kutilmoqda...</p>
        </div>

        <button
          onClick={onCancel}
          disabled={loading}
          className="btn-secondary w-full py-2 rounded-lg font-mono text-xs border-2 border-border hover:border-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
        >
          Bekor qilish
        </button>
      </div>
    );
  }

  // Click uchun - webhook kutish va "To'lov qildim" tugma
  return (
    <div className="space-y-4 py-4">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto">
          <svg className="animate-spin text-accent" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <div className="space-y-1">
          <h3 className="font-mono font-bold text-lg sm:text-xl">Click to'lov kutilmoqda</h3>
          <p className="text-secondary-text text-xs sm:text-sm">
            Yangi oynada to'lovni amalga oshiring
          </p>
        </div>
      </div>

      {/* Click qadamlari */}
      <div className="bg-secondary-bg border border-border rounded-lg p-4">
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex items-start space-x-2">
            <span className="text-accent font-bold">1.</span>
            <span>Click app'da yoki brauzerda to'lov sahifasi ochiladi</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-accent font-bold">2.</span>
            <span>Kartangiz ma'lumotlarini kiriting va to'lovni tasdiqlang</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-accent font-bold">3.</span>
            <span>To'lov muvaffaqiyatli bo'lgach, bu oynaga qaytib "To'lov qildim" tugmasini bosing</span>
          </div>
        </div>
      </div>

      {/* To'lov qildim tugmasi */}
      <button
        onClick={onCheckPayment}
        disabled={loading}
        className="btn-primary w-full py-3 rounded-lg font-mono font-bold text-sm bg-accent text-[#0a0a0a] hover:bg-transparent hover:text-accent border-2 border-accent transition-all disabled:opacity-50"
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Status tekshirilmoqda...</span>
          </div>
        ) : (
          '✓ To\'lov qildim'
        )}
      </button>

      <button
        onClick={onCancel}
        disabled={loading}
        className="btn-secondary w-full py-2 rounded-lg font-mono text-xs border-2 border-border hover:border-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
      >
        Bekor qilish
      </button>

      <p className="text-center text-xs text-secondary-text">
        ⚠️ Click to'lov sahifasi yangi oynada ochildi. Agar ko'rinmasa,{' '}
        <span className="text-accent">popup blocker</span>ni o'chiring.
      </p>
    </div>
  );
}
