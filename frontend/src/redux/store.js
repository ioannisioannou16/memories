import { configureStore } from '@reduxjs/toolkit'
import authReducer from './auth'
import memoriesReducer from './memories'
import systemSlice from './system'

const store = configureStore({
  reducer: {
    auth: authReducer,
    memories: memoriesReducer,
    system: systemSlice
  }
});

export default store
