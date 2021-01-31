import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    removeToken: (state) => {
      state.token = null;
    }
  }
})

export const { setToken, removeToken } = authSlice.actions

export const login = (token) => {
  window.localStorage.setItem("token", token);
  return setToken(token);
}

export const logout = () => {
  window.localStorage.removeItem("token");
  return removeToken();
}

export default authSlice.reducer
