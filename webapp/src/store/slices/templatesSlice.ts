import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Template, TemplatesResponse } from '@/types';
import api from '@/services/api';

interface TemplatesState {
  templates: Template[];
  total: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  loading: boolean;
  error: string | null;
}

const initialState: TemplatesState = {
  templates: [],
  total: 0,
  currentPage: 1,
  totalPages: 1,
  itemsPerPage: 6,
  loading: false,
  error: null,
};

export const fetchTemplates = createAsyncThunk(
  'templates/fetchTemplates',
  async ({ page, limit }: { page: number; limit: number }) => {
    const response = await api.getTemplates(page, limit);
    return response;
  }
);

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    incrementTemplateUsage: (state, action: PayloadAction<number>) => {
      const template = state.templates.find(t => t.id === action.payload);
      if (template) {
        template.usageCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action: PayloadAction<TemplatesResponse>) => {
        state.loading = false;
        state.templates = action.payload.templates;
        state.total = action.payload.total;
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.total_pages;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch templates';
      });
  },
});

export const { setPage, incrementTemplateUsage } = templatesSlice.actions;
export default templatesSlice.reducer;
