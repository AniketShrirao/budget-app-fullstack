import { db } from './dbService';
import { supabase } from '../lib/supabase';

export async function registerPeriodicSync() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      // Type assertion to handle the unknown type of periodicSync
      const periodicSync = (registration as any).periodicSync;
      if ('periodicSync' in registration && periodicSync) {
        await periodicSync.register('sync-data', {
          minInterval: 24 * 60 * 60 * 1000, // 24 hours
        });
      }
    } catch (error) {
      console.error('Periodic sync could not be registered:', error);
    }
  }
}

export async function syncData() {
  try {
    // Sync transactions
    const offlineTransactions = await db.transactions.toArray();
    if (offlineTransactions.length > 0) {
      const { error } = await supabase
        .from('transactions')
        .upsert(offlineTransactions);
      if (!error) {
        await db.transactions.clear();
      }
    }

    // Sync lendings
    const offlineLendings = await db.lendings.toArray();
    if (offlineLendings.length > 0) {
      const { error } = await supabase
        .from('lendings')
        .upsert(offlineLendings);
      if (!error) {
        await db.lendings.clear();
      }
    }
  } catch (error) {
    console.error('Data sync failed:', error);
  }
}