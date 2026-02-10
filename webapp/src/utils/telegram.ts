import { TelegramWebApp, TelegramUser } from '@/types';

export const getTelegramWebApp = (): TelegramWebApp | null => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

export const checkWebAppVersion = (requiredVersion: string): boolean => {
  const tg = getTelegramWebApp();
  if (!tg) return false;

  const currentVersion = tg.version || '6.0';

  // Simple version comparison (assumes format like "6.1", "6.10", "7.0")
  const current = parseFloat(currentVersion);
  const required = parseFloat(requiredVersion);

  return current >= required;
};

export const isInvoiceSupported = (): boolean => {
  const tg = getTelegramWebApp();
  if (!tg) return false;

  // openInvoice qo'shilgan versiya 6.1
  return checkWebAppVersion('6.1') && typeof tg.openInvoice === 'function';
};

export const getTelegramUser = (): TelegramUser | null => {
  const tg = getTelegramWebApp();
  return tg?.initDataUnsafe?.user || null;
};

export const isTelegramWebApp = (): boolean => {
  return getTelegramWebApp() !== null;
};

export const expandTelegramWebApp = (): void => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.ready();
    tg.expand();
  }
};

export const closeTelegramWebApp = (): void => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.close();
  }
};

export const showTelegramAlert = (message: string): void => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.showAlert(message);
  } else {
    alert(message);
  }
};

export const hapticFeedback = (
  type: 'impact' | 'notification' | 'selection',
  style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'error' | 'success' | 'warning'
): void => {
  const tg = getTelegramWebApp();
  if (tg && tg.HapticFeedback) {
    if (type === 'impact' && style) {
      tg.HapticFeedback.impactOccurred(style as 'light' | 'medium' | 'heavy' | 'rigid' | 'soft');
    } else if (type === 'notification' && style) {
      tg.HapticFeedback.notificationOccurred(style as 'error' | 'success' | 'warning');
    } else if (type === 'selection') {
      tg.HapticFeedback.selectionChanged();
    }
  }
};

export const setTelegramHeaderColor = (color: string): void => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.headerColor = color;
  }
};

export const setTelegramBackgroundColor = (color: string): void => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.backgroundColor = color;
  }
};
