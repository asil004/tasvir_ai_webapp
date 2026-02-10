import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import templatesReducer from './slices/templatesSlice';
import generationReducer from './slices/generationSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    templates: templatesReducer,
    generation: generationReducer,
    subscription: subscriptionReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['generation/addUploadedImage'],
        ignoredPaths: ['generation.uploadedImages'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
