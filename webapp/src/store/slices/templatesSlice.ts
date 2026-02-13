import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Template, TemplatesResponse, Category, CategoriesResponse } from '@/types';
import api from '@/services/api';

interface TemplatesState {
  templates: Template[];
  total: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  loading: boolean;
  error: string | null;
  categories: Category[];
  selectedCategoryId: number | null;
  categoriesLoading: boolean;
}

const initialState: TemplatesState = {
  templates: [],
  total: 0,
  currentPage: 1,
  totalPages: 1,
  itemsPerPage: 6,
  loading: false,
  error: null,
  categories: [],
  selectedCategoryId: null,
  categoriesLoading: false,
};

export const fetchCategories = createAsyncThunk(
  'templates/fetchCategories',
  async () => {
    const response = await api.getCategories();
    return response;
  }
);

export const fetchTemplates = createAsyncThunk(
  'templates/fetchTemplates',
  async ({ page, limit, categoryId }: { page: number; limit: number; categoryId?: number }) => {
    const response = await api.getTemplates(page, limit, categoryId);
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
    setSelectedCategory: (state, action: PayloadAction<number | null>) => {
      state.selectedCategoryId = action.payload;
      state.currentPage = 1;
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
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<CategoriesResponse>) => {
        state.categoriesLoading = false;
        state.categories = action.payload?.categories || [];
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.categoriesLoading = false;
      })
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action: PayloadAction<TemplatesResponse>) => {
        state.loading = false;
        state.templates = action.payload?.templates || [];
        state.total = action.payload?.total || 0;
        state.currentPage = action.payload?.page || 1;
        state.totalPages = action.payload?.total_pages || 1;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch templates';
      });
  },
});

export const { setPage, setSelectedCategory, incrementTemplateUsage } = templatesSlice.actions;
export default templatesSlice.reducer;
