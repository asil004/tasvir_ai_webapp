import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Channel, SubscriptionCheckResponse, SubGramSponsor } from '@/types';
import api from '@/services/api';

interface SubscriptionState {
  channels: Channel[];
  sponsors: SubGramSponsor[];
  isSubscribed: boolean;
  requiresPayment: boolean;
  hasFreeImages: boolean;
  gateway: string | null;
  priceStars: number | null;
  priceUzs: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  channels: [],
  sponsors: [],
  isSubscribed: false,
  requiresPayment: false,
  hasFreeImages: false,
  gateway: null,
  priceStars: null,
  priceUzs: null,
  loading: false,
  error: null,
};

export const checkSubscription = createAsyncThunk(
  'subscription/check',
  async ({ userId, templateId }: { userId: number; templateId: number }) => {
    const response = await api.checkSubscription(userId, templateId);
    return response;
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    setSubscribed: (state, action: PayloadAction<boolean>) => {
      state.isSubscribed = action.payload;
    },
    setChannels: (state, action: PayloadAction<Channel[]>) => {
      state.channels = action.payload;
    },
    resetSubscription: (state) => {
      state.channels = [];
      state.sponsors = [];
      state.isSubscribed = false;
      state.requiresPayment = false;
      state.hasFreeImages = false;
      state.gateway = null;
      state.priceStars = null;
      state.priceUzs = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkSubscription.fulfilled, (state, action: PayloadAction<SubscriptionCheckResponse>) => {
        state.loading = false;
        state.isSubscribed = action.payload.subscribed;
        state.requiresPayment = action.payload.requires_payment || false;
        state.hasFreeImages = action.payload.has_free_images || false;
        state.gateway = action.payload.gateway || null;

        // Template price from template_price object
        if (action.payload.template_price) {
          state.priceStars = action.payload.template_price.price_stars || null;
          state.priceUzs = action.payload.template_price.price_uzs || null;
        }

        // Sponsors array
        if (action.payload.sponsors && action.payload.sponsors.length > 0) {
          state.sponsors = action.payload.sponsors;
          state.channels = action.payload.sponsors.map((s, i) => ({
            id: i + 1,
            name: s.button_text || s.resource_name || `Channel ${i + 1}`,
            username: s.resource_name || '',
            url: s.link,
            subscribed: s.status === 'subscribed',
          }));
        } else {
          state.sponsors = [];
          state.channels = [];
        }
      })
      .addCase(checkSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Subscription check failed';
        // Fallback: allow to continue on error
        state.isSubscribed = true;
        state.requiresPayment = false;
      });
  },
});

export const { setSubscribed, setChannels, resetSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
