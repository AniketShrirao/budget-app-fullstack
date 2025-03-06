import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProfileState {
  displayName: string;
  email: string;
  avatar: string;
  phone: string;
  currency: string;
  bio: string;
}

const initialState: ProfileState = {
  displayName: '',
  email: '',
  avatar: '',
  phone: '',
  currency: 'INR',
  bio: ''
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<Partial<ProfileState>>) => {
      return { ...state, ...action.payload };
    },
    loadProfile: (_state, action: PayloadAction<ProfileState>) => {
      return action.payload;
    }
  }
});

export const { updateProfile, loadProfile } = profileSlice.actions;
export default profileSlice.reducer;