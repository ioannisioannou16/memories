import api from '../api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const fetchAlbum = createAsyncThunk('album/fetch', (albumId) => api.fetchAlbum(albumId))

const albumDetailSlice = createSlice({
  name: 'album-details',
  initialState: {
    byId: {},
    isLoading: false,
  },
  reducers: {
  },
  extraReducers: {
    [fetchAlbum.pending]: (state) => {
      state.isLoading = true;
    },
    [fetchAlbum.fulfilled]: (state, action) => {
      state.byId[action.payload.albumId] = action.payload;
      state.isLoading = false;
    },
    [fetchAlbum.rejected]: (state) => {
      state.isLoading = false;
    },
  }
})

export default albumDetailSlice.reducer
