import axios from 'axios';
import {
  TemplatesResponse,
  GenerationRequest,
  SubscriptionCheckResponse,
  PaymentCreateResponse,
  PaymentConfirmResponse
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

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
    const response = await apiClient.get(`/api/v1/generation/${requestId}`);
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
    const response = await apiClient.post(`/api/v1/create-payment`, {
      user_id: userId,
      template_id: templateId,
      generation_request_id: generationRequestId,
      payment_method: paymentMethod,
    });
    return response.data;
  },

  confirmPayment: async (
    generationRequestId: number,
    paymentMethod: 'stars' | 'click'
  ): Promise<PaymentConfirmResponse> => {
    const response = await apiClient.post(`/api/v1/confirm-payment`, {
      generation_request_id: generationRequestId,
      payment_method: paymentMethod,
    });
    return response.data;
  },
};

export default api;
