import { toast } from 'react-toastify';
import { DEFAULT_TYPES } from '../../constants';
import { supabase } from '../../lib/supabase';

export const typesDB = {
  async fetchAll(userId: string) {
    if (!userId) throw new Error('User ID is required');

    const { data, error } = await supabase
      .from('transaction_types')
      .select('id, name, user_ids, created_at')
      .contains('user_ids', [userId])
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async add(type: { name: string; user_id: string }) {
    if (!type.user_id) throw new Error('User ID is required');

    // Check if type already exists for this user
    const { data: existingType } = await supabase
      .from('transaction_types')
      .select('id, user_ids')
      .eq('name', type.name)
      .contains('user_ids', [type.user_id])
      .maybeSingle();

    if (existingType) {
      throw new Error('Type already exists for this user');
    }

    const { data, error } = await supabase
      .from('transaction_types')
      .insert([{
        name: type.name,
        user_ids: [type.user_id]
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: { name: string }, userId: string) {
    if (!userId) throw new Error('User ID is required');

    // First, get the current type
    const { data: currentType } = await supabase
      .from('transaction_types')
      .select('user_ids')
      .eq('id', id)
      .single();

    if (!currentType?.user_ids.includes(userId)) {
      throw new Error('Unauthorized to update this type');
    }

    const { data, error } = await supabase
      .from('transaction_types')
      .update({ name: updates.name })
      .eq('id', id)
      .contains('user_ids', [userId])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  async delete(id: string, userId: string) {
    if (!userId) throw new Error('User ID is required');
  
    // Get the type name from id
    const { data: currentDeleteType } = await supabase
      .from('transaction_types')
      .select('name')
      .eq('id', id)
      .single();
  
    // First, check for associated transactions
    const { data: linkedTransactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('type', currentDeleteType?.name);

      if(linkedTransactions && linkedTransactions.length > 0) {

        toast.error(`Cannot delete type "${currentDeleteType?.name}": ${linkedTransactions.length} transaction(s) are using this type. Please update or delete those transactions first.`, {
          position: 'bottom-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true
        });
        throw new Error('Cannot delete type');
        
      }
  
    if (txError) throw txError;
  
    // Then proceed with type deletion
    const { data: currentType } = await supabase
      .from('transaction_types')
      .select('user_ids')
      .eq('id', id)
      .single();
  
    if (!currentType) {
      throw new Error('Type not found');
    }
  
    // If this is the only user, delete the type
    if (currentType.user_ids.length === 1 && currentType.user_ids[0] === userId) {
      const { error } = await supabase
        .from('transaction_types')
        .delete()
        .eq('id', id);
  
      if (error) throw error;
    } else {
      const updatedUserIds = currentType.user_ids.filter((id: string) => id !== userId);
      const { error } = await supabase
        .from('transaction_types')
        .update({ user_ids: updatedUserIds })
        .eq('id', id);
  
      if (error) throw error;
    }
  
    return id;
  },
  async addUserToDefaultTypes(userId: string) {
    if (!userId) throw new Error('User ID is required');
  
    // First check if default types exist without user filtering
    for (const typeName of DEFAULT_TYPES) {
      const { data: existingType } = await supabase
        .from('transaction_types')
        .select('*')
        .ilike('name', typeName)
        .maybeSingle();
  
    if (existingType) {
      // Add user to existing type if not already included
      if (!existingType.user_ids.includes(userId)) {
        await supabase
          .from('transaction_types')
          .update({
            user_ids: [...existingType.user_ids, userId],
            updated_at: new Date().toISOString()
          })
          .eq('id', existingType.id);
      }
    } else {
      // Create new type if it doesn't exist
      await supabase
        .from('transaction_types')
        .insert([{
          name: typeName,
          user_ids: [userId],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
    }
  }
  }
};