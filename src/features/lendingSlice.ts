import { Lending, LendingState } from '../types/common';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';

const initialState: LendingState = {
  lendings: [],
  loading: false,
  error: null,
};

export const fetchLendings = createAsyncThunk('lendings/fetch', async (userEmail: string) => {
  const { data, error } = await supabase
    .from('lendings')
    .select('*')
    .eq('user_email', userEmail);
  
  if (error) throw new Error(error.message);
  return data;
});

export const deleteLending = createAsyncThunk(
  'lendings/delete', 
  async ({ id, userEmail }: { id: string; userEmail: string }) => {
    const { error } = await supabase
      .from('lendings')
      .delete()
      .eq('id', id)
      .eq('user_email', userEmail);
    
    if (error) throw new Error(error.message);
    return id;
  }
);

export const updateLending = createAsyncThunk(
  'lendings/update', 
  async ({ lending, userEmail }: { lending: Lending; userEmail: string }) => {
    const { data, error } = await supabase
      .from('lendings')
      .update(lending)
      .eq('id', lending.id)
      .eq('user_email', userEmail)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }
);

const lendingSlice = createSlice({
  name: 'lendings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLendings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLendings.fulfilled, (state, action) => {
        state.loading = false;
        state.lendings = action.payload;
      })
      .addCase(fetchLendings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch lendings.';
      })
      .addCase(deleteLending.fulfilled, (state, action) => {
        state.lendings = state.lendings.filter((lending) => lending.id !== action.payload);
      })
      .addCase(updateLending.fulfilled, (state, action) => {
        const index = state.lendings.findIndex((lending) => lending.id === action.payload.id);
        if (index !== -1) {
          state.lendings[index] = action.payload;
        }
      });
  },
});

export default lendingSlice.reducer;