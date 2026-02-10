'use client';

import React, { useEffect, useState } from 'react';
import { getTelegramUser, isTelegramWebApp } from '@/utils/telegram';

export default function DevModeIndicator() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (process.env.NODE_ENV !== 'development' || !mounted) return null;

  const telegramUser = getTelegramUser();
  const isInTelegram = isTelegramWebApp();

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-card border-2 border-accent rounded-lg p-3 text-xs font-mono shadow-lg max-w-xs">
      <div className="font-bold text-accent mb-2">🛠️ DEV MODE</div>
      <div className="space-y-1 text-secondary-text">
        <div className="flex items-center gap-2">
          <span className={isInTelegram ? 'text-green-500' : 'text-red-500'}>●</span>
          <span>Telegram: {isInTelegram ? 'Connected' : 'Not connected'}</span>
        </div>
        {telegramUser ? (
          <div className="text-green-500">
            ✓ User: {telegramUser.first_name} (ID: {telegramUser.id})
          </div>
        ) : (
          <div className="text-yellow-500">
            ⚠️ Test mode: Using dummy user (1046805799)
          </div>
        )}
      </div>
    </div>
  );
}
