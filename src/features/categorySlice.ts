import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import { Category } from '../types/category';
import { RootState } from '../store';


export const fetchCategories = createAsyncThunk(
  'categories/fetch',
  async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('title');
    
    if (error) throw error;
    return data;
  }
);

export const addCategory = createAsyncThunk(
  'categories/add',
  async (category: Omit<Category, 'id' | 'user_id'>, { getState }) => {
    const state = getState() as RootState;
    const validTypes = state.types.types.map(t => t.name);
    
    if (!validTypes.includes(category.type)) {
      throw new Error('Invalid category type');
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([{ ...category, user_id: (await supabase.auth.getUser()).data.user?.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
);

// Similar validation for updateCategory
export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, updates }: { id: string; updates: Partial<Category> }, { getState }) => {
    if (updates.type) {
      const state = getState() as RootState;
      const validTypes = state.types.types.map(t => t.name);
      
      if (!validTypes.includes(updates.type)) {
        throw new Error('Invalid category type');
      }
    }

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return id;
  }
);

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
        toast.success('Category added successfully');
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        const index = state.categories.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        toast.success('Category updated successfully');
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.categories = state.categories.filter(cat => cat.id !== action.payload);
        toast.success('Category deleted successfully');
      });
  },
});

export default categorySlice.reducer;
