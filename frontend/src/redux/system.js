import { createSlice } from '@reduxjs/toolkit'

const systemSlice = createSlice({
  name: 'system',
  initialState: {
    notification: null
  },
  reducers: {
    sendNotification(state, action) {
      console.log(action.payload);
      state.notification = action.payload;
    }
  }
})

export const { sendNotification } = systemSlice.actions

export default systemSlice.reducer
