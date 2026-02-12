import axios from 'axios';
import {
  TemplatesResponse,
  GenerationRequest,
  SubscriptionCheckResponse,
  PaymentCreateResponse,
  PaymentConfirmResponse
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// In the browser, use relative URLs so requests go through Next.js rewrites (same origin).
// This avoids mixed content (HTTPS->HTTP) issues in Telegram WebApp.
// On the server side (SSR), use the full backend URL directly.
const EFFECTIVE_BASE_URL = typeof window !== 'undefined' ? '' : API_BASE_URL;

console.log('🌐 API_BASE_URL:', API_BASE_URL);
console.log('🌐 EFFECTIVE_BASE_URL:', EFFECTIVE_BASE_URL);

const apiClient = axios.create({
  baseURL: EFFECTIVE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Test connection on startup
if (typeof window !== 'undefined') {
  console.log('🔌 Testing backend connection...');
  fetch(`/api/v1/templates?page=1&limit=1`)
    .then(res => {
      if (res.ok) {
        console.log('✅ Backend connection OK');
      } else {
        console.error('❌ Backend returned error:', res.status);
      }
    })
    .catch(err => {
      console.error('❌ Backend connection failed:', err.message);
    });
}

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    // Log errors in development WITH FULL DETAILS
    console.error('❌ API Error FULL DETAILS:', {
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL + error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code,
      headers: error.response?.headers,
      request: error.request ? 'present' : 'missing',
      response: error.response ? 'present' : 'missing',
    });

    // Return a more detailed error
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data?.message
        || error.response.data?.error
        || error.response.data?.detail
        || `Server xatosi (${error.response.status})`;

      const customError = new Error(errorMessage);
      (customError as any).response = error.response;
      throw customError;
    } else if (error.request) {
      // The request was made but no response was received
      console.error('❌ NO RESPONSE FROM SERVER:', {
        code: error.code,
        message: error.message,
        errno: error.errno,
        syscall: error.syscall,
      });

      // This could be network error, CORS, timeout, etc.
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('So\'rov vaqti tugadi. Qayta urinib ko\'ring.');
      } else if (error.message.includes('Network Error')) {
        // Check if it's CORS issue
        console.error('❌ Network Error - Bu CORS muammosi bo\'lishi mumkin!');
        console.error('❌ Backend CORS sozlanganini tekshiring!');
        throw new Error('Backend\'ga ulanib bo\'lmadi. CORS muammosi bo\'lishi mumkin.');
      } else {
        // For other cases, just pass through the original error
        // Don't throw a new error, return the original
        console.error('❌ Unknown request error, passing through...');
        return Promise.reject(error);
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('❌ Request setup error, passing through...');
      return Promise.reject(error);
    }
  }
);

const api = {
  getTemplates: async (page: number = 1, limit: number = 6): Promise<TemplatesResponse> => {
    const response = await apiClient.get(`/api/v1/templates`, {
      params: { page, limit },
    });
    return response.data;
  },

  checkSubscription: async (userId: number, templateId: number): Promise<SubscriptionCheckResponse> => {
    const response = await apiClient.post(`/api/v1/check-subscription`, {
      user_id: userId,
      template_id: templateId,
    });
    return response.data;
  },

  generateImage: async (
    templateId: number,
    userId: number,
    images: File[],
    paymentVerified: boolean = false
  ): Promise<GenerationRequest> => {
    const formData = new FormData();
    formData.append('template_id', templateId.toString());
    formData.append('user_id', userId.toString());
    formData.append('payment_verified', paymentVerified.toString());

    images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await apiClient.post(`/api/v1/generate`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    });
    return response.data;
  },

  getGenerationStatus: async (requestId: number): Promise<GenerationRequest> => {
    console.log('🔍 Getting generation status for:', requestId);

    const response = await apiClient.get(`/api/v1/generation/${requestId}`);

    console.log('🔍 Generation status response:', {
      requestId,
      status: response.data.status,
      image_url: response.data.image_url,
      error: response.data.error,
    });

    // Validate response
    if (!response.data) {
      throw new Error('Bo\'sh javob qaytdi');
    }

    // Ensure image_url is present when status is COMPLETED
    if (response.data.status === 'COMPLETED' && !response.data.image_url) {
      console.error('❌ Status is COMPLETED but no image_url!', response.data);
      throw new Error('Rasm URL topilmadi');
    }

    return response.data;
  },

  downloadImage: async (url: string): Promise<Blob> => {
    const response = await apiClient.get(url, {
      responseType: 'blob',
    });
    return response.data;
  },

  createPayment: async (
    userId: number,
    templateId: number,
    generationRequestId: number,
    paymentMethod: 'stars' | 'click'
  ): Promise<PaymentCreateResponse> => {
    console.log('💳 Sending payment request:', {
      user_id: userId,
      template_id: templateId,
      generation_request_id: generationRequestId,
      payment_method: paymentMethod,
      timestamp: new Date().toISOString(),
    });

    try {
      // Longer timeout for payment requests (60 seconds)
      const response = await apiClient.post(`/api/v1/create-payment`, {
        user_id: userId,
        template_id: templateId,
        generation_request_id: generationRequestId,
        payment_method: paymentMethod,
      }, {
        timeout: 60000, // 60 seconds
      });

      console.log('💳 Payment response received:', response.data);

      // Validate response
      if (!response.data) {
        throw new Error('Bo\'sh javob qaytdi');
      }

      // For stars, check invoice_url
      if (paymentMethod === 'stars' && !response.data.invoice_url) {
        console.error('❌ Missing invoice_url in Stars response:', response.data);
        throw new Error('Invoice URL topilmadi');
      }

      // For click, check payment_url
      if (paymentMethod === 'click' && !response.data.payment_url) {
        console.error('❌ Missing payment_url in Click response:', response.data);
        throw new Error('Payment URL topilmadi');
      }

      return response.data;
    } catch (error: any) {
      console.error('💳 Payment request failed:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  confirmPayment: async (
    generationRequestId: number,
    paymentMethod: 'stars' | 'click'
  ): Promise<PaymentConfirmResponse> => {
    console.log('✅ Sending payment confirmation:', {
      generation_request_id: generationRequestId,
      payment_method: paymentMethod,
    });

    const response = await apiClient.post(`/api/v1/confirm-payment`, {
      generation_request_id: generationRequestId,
      payment_method: paymentMethod,
    });

    console.log('✅ Payment confirmation response:', response.data);

    return response.data;
  },
};

export default api;
