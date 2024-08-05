import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  newUser: {},
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUser: (state, user) => {
      state.newUser = user;
    },
    removeUser: (state) => {
      state.newUser = {};
    },
  },
});

export const { addUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
