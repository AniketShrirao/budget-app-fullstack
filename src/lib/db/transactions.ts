import { supabase } from '../supabase';
import { Transaction } from '../../types/transaction';

// Create Transaction Table if it does not exist
const createTableIfNotExist = async () => {
  const { error } = await supabase.rpc(
    'create_transactions_table_if_not_exists',
  );

  if (error) {
    console.error('Error creating table:', error.message);
    throw error;
  }
};

// Create Transaction if not exists
export const createTransaction = async (
  transaction: Omit<Transaction, 'id'>,
  userId: string,
) => {
  try {
    // Ensure the table exists before inserting
    await createTableIfNotExist();

    // Insert the transaction into the table
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...transaction, user_id: userId }])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating transaction:', (error as any).message);
    throw error;
  }
};

// Get all Transactions
export const getTransactions = async (userId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId); // Fetch only transactions for the authenticated user

  if (error) throw error;
  return data;
};

// Delete Transaction by ID
export const deleteTransaction = async (id: string, userId: string) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId); // Ensure the user can only delete their own transactions

  if (error) throw error;
};
