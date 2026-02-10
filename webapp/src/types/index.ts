export interface Template {
  id: number;
  title: string;
  description: string;
  image: string;
  requiredImages: number;
  usageCount: number;
  priceStars?: number;
  priceUzs?: number;
  size?: string;
}

export interface TemplatesResponse {
  templates: Template[];
  total: number;
  page: number;
  total_pages: number;
}

export interface Channel {
  id: number;
  name: string;
  username: string;
  url: string;
  subscribed: boolean;
}

export interface GenerationRequest {
  status: 'generating' | 'awaiting_payment' | 'COMPLETED' | 'FAILED' | 'PENDING' | 'PROCESSING' | 'WAITING_PAYMENT' | 'error';
  request_id?: number;
  requires_payment?: boolean;
  image_url?: string;
  error?: string;
  message?: string;
}

export interface SubGramSponsor {
  button_text: string;
  resource_name: string;
  link: string;
  available_now: boolean;
  status: string;
}

export interface TemplatePrice {
  price_stars: number;
  price_uzs: number;
}

export interface SubscriptionCheckResponse {
  subscribed: boolean;
  requires_payment: boolean;
  sponsors?: SubGramSponsor[];
  template_price?: TemplatePrice;
}

export interface PaymentCreateResponse {
  status: string;
  payment_method: 'stars' | 'click';
  invoice_url?: string;  // Stars uchun - Telegram invoice URL
  payment_url?: string;  // Click uchun - Click payment URL
  price?: number;
}

export interface PaymentConfirmResponse {
  status: string;
  message: string;
}

export interface UploadedImage {
  file: File;
  preview: string;
  name: string;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setParams: (params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{ id?: string; type?: string; text?: string }>;
  }, callback?: (id: string) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  openInvoice: (url: string, callback?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void) => void;
  ready: () => void;
  expand: () => void;
  close: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}
