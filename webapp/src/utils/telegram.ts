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

// === Error Reporting ===

export interface ErrorDetails {
  url?: string;
  method?: string;
  status?: number | string;
  message: string;
  code?: string;
  timestamp: string;
  userAgent: string;
  telegramVersion?: string;
  platform?: string;
  initDataLength?: number;
}

export const buildErrorReport = (details: ErrorDetails): string => {
  const lines = [
    'ERROR REPORT',
    `Time: ${details.timestamp}`,
    `URL: ${details.url || 'N/A'}`,
    `Method: ${details.method || 'N/A'}`,
    `Status: ${details.status || 'N/A'}`,
    `Message: ${details.message}`,
    `Code: ${details.code || 'N/A'}`,
    `User Agent: ${details.userAgent}`,
    `TG Version: ${details.telegramVersion || 'N/A'}`,
    `Platform: ${details.platform || 'N/A'}`,
    `initData len: ${details.initDataLength ?? 'N/A'}`,
  ];
  return lines.join('\n');
};

export const collectTelegramInfo = (): Pick<ErrorDetails, 'telegramVersion' | 'platform' | 'initDataLength'> => {
  const tg = getTelegramWebApp();
  return {
    telegramVersion: tg?.version,
    platform: tg?.platform,
    initDataLength: tg?.initData?.length,
  };
};

export const sendErrorReport = (details: ErrorDetails): void => {
  const report = buildErrorReport(details);

  // Strategy A: Try sendBeacon to backend
  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(details)], { type: 'application/json' });
      navigator.sendBeacon('/api/v1/error-log', blob);
    }
  } catch {
    // sendBeacon failed, continue to other strategies
  }

  // Strategy B: Show in Telegram popup (truncated to fit)
  const tg = getTelegramWebApp();
  if (tg) {
    const truncated = report.length > 200 ? report.substring(0, 197) + '...' : report;
    try {
      tg.showPopup({
        title: 'Error Detail',
        message: truncated,
        buttons: [{ type: 'ok' }],
      });
    } catch {
      try {
        tg.showAlert(truncated);
      } catch {
        // ignore
      }
    }
  }

  // Strategy C: Copy to clipboard
  copyErrorToClipboard(report);
};

export const copyErrorToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Clipboard API failed, try fallback
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
  return false;
};
