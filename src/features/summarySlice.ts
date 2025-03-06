import { SummaryState } from '../types/common';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { updateSummary } from '../lib/db/summary';
import { RootState } from '../store';
import * as summaryDB from '../lib/db/summary';

const initialState: SummaryState = {
  status: 'idle',
  data: {},
  loading: false,
  error: null,
  currentMonth: new Date().getMonth() + 1 + ''
};

// **Fetch monthly summary**
export const fetchMonthlySummary = createAsyncThunk(
  'summary/fetchMonthlySummary',
  async ({ userId, month }: { userId: string; month: string }) => {
    return await summaryDB.fetchSummary(userId, month);
  }
);

// **Update monthly summary**
export const updateMonthlySummary = createAsyncThunk(
  'summary/updateMonthlySummary',
  async ({
    userId,
    month,
    updatedSummary,
  }: {
    userId: string;
    month: string;
    updatedSummary: Record<string, any>;
  }) => {
    await updateSummary(userId, month, updatedSummary);
    return { month, summary: updatedSummary };
  },
);

export const updateAllSummariesType = createAsyncThunk(
  'summary/updateAllSummariesType',
  async ({ oldName, newName }: { oldName: string; newName: string }, { getState }) => {
    const state = getState() as RootState;
    const summaries = Object.values(state.summary.data);
    
    for (const summary of summaries) {
      const updatedTypes = summary.types.map(type => 
        type.name === oldName ? { ...type, name: newName } : type
      );
      
      if (summary.user_id && summary.month) {
        await summaryDB.updateSummary(summary.user_id, summary.month, {
          ...summary,
          types: updatedTypes
        });
      }
    }
  }
);

export const addTypeToAllSummaries = createAsyncThunk(
  'summary/addTypeToAllSummaries',
  async ({ name, userId }: { name: string; userId: string }, { getState }) => {
    const state = getState() as RootState;
    const summaries = Object.values(state.summary.data);
    
    for (const summary of summaries) {
      if (!summary.month) continue;
      
      const updatedTypes = [...summary.types, { name, percentage: 0 }];
      await summaryDB.updateSummary(userId, summary.month, {
        ...summary,
        types: updatedTypes
      });
    }
  }
);

const summarySlice = createSlice({
  name: 'summary',
  initialState,
  reducers: {
    setCurrentMonth: (state, action) => {
      state.currentMonth = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonthlySummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMonthlySummary.fulfilled, (state, action) => {
        state.loading = false;
        state.data[action.payload.month] = action.payload;
      })
      .addCase(fetchMonthlySummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch summary';
      })
      .addCase(updateMonthlySummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateMonthlySummary.fulfilled, (state, action) => {
        state.loading = false;
        state.data[action.payload.month] = {
          month: action.payload.month,
          budget: action.payload.summary.budget || {},
          types: action.payload.summary.types || {},
          transactions: action.payload.summary.transactions || []
        };
      })
      .addCase(updateMonthlySummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update summary';
      });
  },
});

export const selectSummary = (state: RootState) => state.summary.data;
export const { setCurrentMonth } = summarySlice.actions;
export default summarySlice.reducer;