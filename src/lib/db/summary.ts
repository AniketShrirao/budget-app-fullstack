import { SummaryData } from '../../types/common';
import { TypeSummary } from '../../types/type';
import { supabase } from '../supabase';
import { typesDB } from './types';

export const fetchSummary = async (
  userId: string,
  month: string,
): Promise<SummaryData> => {
  const allTypes = await typesDB.fetchAll(userId);
  const defaultTypes: TypeSummary[] = allTypes.map(type => ({
    name: type.name,
    percentage: 100 / allTypes.length
  }));

  const { data, error } = await supabase
    .from('summary')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .maybeSingle();

  if (error || !data) {
    return {
      user_id: userId,
      month,
      budget: 100,
      types: defaultTypes,
      transactions: []
    };
  }

  // Ensure all types exist in existing summary
  const updatedTypes = allTypes.map(type => {
    const existing = data.types?.find((t: { name: string }) => t.name === type.name);
    return existing || { name: type.name, percentage: 0 };
  });

  return {
    ...data,
    types: updatedTypes
  };
};

export const updateSummary = async (
  userId: string,
  month: string,
  updatedSummary: Partial<SummaryData>,
): Promise<SummaryData | null> => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!month) {
      throw new Error('Month is required');
    }

    const allTypes = await typesDB.fetchAll(userId);
    
    if (!allTypes || allTypes.length === 0) {
      throw new Error('No transaction types found for user');
    }

    const summaryToUpdate: SummaryData = {
      user_id: userId,
      month,
      budget: updatedSummary.budget ?? 100,
      types: updatedSummary.types ?? allTypes.map(type => ({
        name: type.name,
        percentage: 100 / allTypes.length
      })),
      transactions: updatedSummary.transactions ?? []
    };

    const { data, error } = await supabase
      .from('summary')
      .upsert([summaryToUpdate], {
        onConflict: 'user_id,month'
      })
      .select('*')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Failed to update summary');
    }

    return data;
  } catch (err) {
    console.error('Error updating summary:', err);
    throw err; // Re-throw to handle in the component
  }
};

export const updateAllSummariesType = async (
  userId: string,
  oldName: string,
  newName: string
): Promise<void> => {
  const { data: summaries } = await supabase
    .from('summary')
    .select('*')
    .eq('user_id', userId);

  if (!summaries) return;

  for (const summary of summaries) {
    const updatedTypes = summary.types.map((type: { name: string }) => 
      type.name === oldName ? { ...type, name: newName } : type
    );

    await updateSummary(userId, summary.month, {
      ...summary,
      types: updatedTypes
    });
  }
};