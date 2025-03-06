export interface TransactionType {
  id: string;
  name: string;
  user_ids: string[];
  created_at?: string;
  updated_at?: string;
}

export interface TypeSummary {
  name: string;
  percentage: number;
}

export interface TypeState {
  types: TransactionType[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}