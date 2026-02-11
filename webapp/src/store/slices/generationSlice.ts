import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { GenerationRequest, UploadedImage } from '@/types';
import api from '@/services/api';

interface GenerationState {
  selectedTemplateId: number | null;
  uploadedImages: UploadedImage[];
  generationStatus: GenerationRequest | null;
  loading: boolean;
  error: string | null;
  progress: number;
  resultImageUrl: string | null;
}

const initialState: GenerationState = {
  selectedTemplateId: null,
  uploadedImages: [],
  generationStatus: null,
  loading: false,
  error: null,
  progress: 0,
  resultImageUrl: null,
};

export const generateImage = createAsyncThunk(
  'generation/generateImage',
  async ({ templateId, userId, images }: { templateId: number; userId: number; images: File[] }) => {
    const response = await api.generateImage(templateId, userId, images);
    return response;
  }
);

export const checkGenerationStatus = createAsyncThunk(
  'generation/checkStatus',
  async (requestId: number) => {
    const response = await api.getGenerationStatus(requestId);
    return response;
  }
);

const generationSlice = createSlice({
  name: 'generation',
  initialState,
  reducers: {
    setSelectedTemplate: (state, action: PayloadAction<number>) => {
      state.selectedTemplateId = action.payload;
      state.uploadedImages = [];
      state.error = null;
    },
    addUploadedImage: (state, action: PayloadAction<UploadedImage>) => {
      state.uploadedImages.push(action.payload);
    },
    removeUploadedImage: (state, action: PayloadAction<number>) => {
      state.uploadedImages.splice(action.payload, 1);
    },
    clearUploadedImages: (state) => {
      state.uploadedImages = [];
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    resetGeneration: (state) => {
      state.selectedTemplateId = null;
      state.uploadedImages = [];
      state.generationStatus = null;
      state.loading = false;
      state.error = null;
      state.progress = 0;
      state.resultImageUrl = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateImage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.progress = 10;
      })
      .addCase(generateImage.fulfilled, (state, action: PayloadAction<GenerationRequest>) => {
        state.generationStatus = action.payload;
        state.progress = 40;
      })
      .addCase(generateImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Generation failed';
        state.progress = 0;
      })
      .addCase(checkGenerationStatus.fulfilled, (state, action: PayloadAction<GenerationRequest>) => {
        state.generationStatus = action.payload;

        if (action.payload.status === 'COMPLETED') {
          state.loading = false;
          state.progress = 100;
          state.resultImageUrl = action.payload.image_url || null;
        } else if (action.payload.status === 'FAILED') {
          state.loading = false;
          state.error = action.payload.error || 'Generation failed';
          state.progress = 0;
        }
      });
  },
});

export const {
  setSelectedTemplate,
  addUploadedImage,
  removeUploadedImage,
  clearUploadedImages,
  setProgress,
  resetGeneration,
} = generationSlice.actions;

export default generationSlice.reducer;
