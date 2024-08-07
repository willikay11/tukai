import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: undefined,
};

const resetSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    addToken: (state, token) => {
      state.token = token;
    },
    removeToken: (state) => {
      state.token = undefined;
    },
  },
});

export const { addToken, removeToken } = resetSlice.actions;
export default resetSlice.reducer;
