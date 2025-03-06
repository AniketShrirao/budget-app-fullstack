import { SyncQueue } from '../types/common';
import { supabase } from '../lib/supabase';

export class SyncService {
  private queue: SyncQueue[] = [];
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.loadQueueFromStorage();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private loadQueueFromStorage() {
    const savedQueue = localStorage.getItem('syncQueue');
    if (savedQueue) {
      this.queue = JSON.parse(savedQueue);
    }
  }

  private saveQueueToStorage() {
    localStorage.setItem('syncQueue', JSON.stringify(this.queue));
  }

  async queueOperation(action: SyncQueue['action'], table: string, data: any) {
    const operation: SyncQueue = {
      id: crypto.randomUUID(),
      action,
      table,
      data,
      timestamp: Date.now()
    };

    this.queue.push(operation);
    this.saveQueueToStorage();

    if (this.isOnline) {
      await this.processQueue();
    }
  }

  private async processQueue() {
    while (this.queue.length > 0 && this.isOnline) {
      const operation = this.queue[0];
      try {
        await this.syncOperation(operation);
        this.queue.shift();
        this.saveQueueToStorage();
      } catch (error) {
        console.error('Sync failed:', error);
        break;
      }
    }
  }

  private async syncOperation(operation: SyncQueue) {
    switch (operation.action) {
      case 'create':
        await supabase.from(operation.table).insert(operation.data);
        break;
      case 'update':
        await supabase
          .from(operation.table)
          .update(operation.data)
          .eq('id', operation.data.id);
        break;
      case 'delete':
        await supabase
          .from(operation.table)
          .delete()
          .eq('id', operation.data.id);
        break;
    }
  }
}

export const syncService = new SyncService();