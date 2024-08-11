import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  account: {},
};

const resetSlice = createSlice({
  name: 'reset',
  initialState,
  reducers: {
    addToken: (state, token) => {
      state.account = {
        ...state.account,
        ...{ token },
      };
    },
    addEmail: (state, email) => {
      state.account = {
        ...state.account,
        ...{ email },
      };
    },
    removeToken: (state) => {
      state.token = {};
    },
  },
});

export const { addEmail, addToken, removeToken } = resetSlice.actions;
export default resetSlice.reducer;
