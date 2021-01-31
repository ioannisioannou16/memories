import { configureStore } from '@reduxjs/toolkit'
import albumReducer from './album'
import albumDetailsReducer from './albumDetails'
import authReducer, { setToken } from './auth'

const store = configureStore({
  reducer: {
    auth: authReducer,
    album: albumReducer,
    albumDetails: albumDetailsReducer
  }
});

const token = window.localStorage.getItem("token");
if (token) {
  store.dispatch(setToken(token));
}

export default store
