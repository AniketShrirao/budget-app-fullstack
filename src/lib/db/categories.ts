import { supabase } from '../supabase';
import { Category } from '../../types/category';

export const categoriesDB = {
  async fetchAll() {
    const { data: types } = await supabase
      .from('transaction_types')
      .select('name');
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('title');

    if (error) throw error;
    
    // Validate that all categories have valid types
    return data.map(category => ({
      ...category,
      type: types?.some(t => t.name === category.type) ? category.type : 'Needs'
    }));
  },

  async add(category: Omit<Category, 'id' | 'user_id' | 'created_at'>) {
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('categories')
      .insert([{ 
        ...category,
        user_id: userData.user?.id 
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Category>) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};