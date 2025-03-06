import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { typesDB } from '../lib/db/types';
import { TypeState } from '../types/type';
import { CacheManager } from '../utils/cache';
import { TYPES_CACHE_KEY } from '../constants';
import { RootState } from '../store';
// Remove this import as we can't use hooks in thunks
// import { useAuth } from '../context/AuthContext';

export const fetchTypes = createAsyncThunk(
  'types/fetchTypes',
  async (userId: string, { getState }) => {
    const state = getState() as RootState;
    const cache = CacheManager.getInstance();
    
    if (state.types.status === 'succeeded' && state.types.types.length > 0) {
      return state.types.types;
    }

    const types = await typesDB.fetchAll(userId);
    cache.set(TYPES_CACHE_KEY, types);
    return types;
  }
);

export const addType = createAsyncThunk(
  'types/addType',
  async ({ name, userId }: { name: string; userId: string }, { rejectWithValue }) => {
    try {
      return await typesDB.add({ name, user_id: userId });
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateType = createAsyncThunk(
  'types/updateType',
  async ({ 
    id, 
    updates, 
    userId 
  }: { 
    id: string; 
    updates: { name: string }; 
    userId: string 
  }, { rejectWithValue }) => {
    try {
      return await typesDB.update(id, updates, userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteType = createAsyncThunk(
  'types/deleteType',
  async ({ id, userId }: { id: string; userId: string }, { rejectWithValue }) => {
    try {
      return await typesDB.delete(id, userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
const initialState: TypeState = {
  types: [],
  status: 'idle',
  error: null
};

const typeSlice = createSlice({
  name: 'types',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTypes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTypes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.types = action.payload as TypeState['types'];
      })
      .addCase(fetchTypes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(addType.fulfilled, (state, action) => {
        state.types.push(action.payload);
      })
      .addCase(updateType.fulfilled, (state, action) => {
const index = state.types.findIndex(type => type.id === action.meta.arg.id);
        if (index !== -1) {
          state.types[index] = action.payload;
        }
      })
      .addCase(deleteType.fulfilled, (state, action) => {
        state.types = state.types.filter(type => type.id !== action.meta.arg.id);
      });
  }
});

export default typeSlice.reducer;