import { configureStore } from '@reduxjs/toolkit';
import transactionReducer from '../features/transactionSlice';
import summaryReducer from '../features/summarySlice';
import lendingReducer from '../features/lendingSlice';
import categoryReducer from '../features/categorySlice';
import typeReducer from '../features/typeSlice';
import themeReducer from '../features/themeSlice';
import profileReducer from '../features/profileSlice';

export const store = configureStore({
  reducer: {
    summary: summaryReducer,
    transactions: transactionReducer,
    lendings: lendingReducer,
    categories: categoryReducer,
    types: typeReducer,
    theme: themeReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
