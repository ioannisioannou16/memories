import api from '../api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const createAlbum = createAsyncThunk('album/createNew', () => api.createAlbum())

const albumSlice = createSlice({
  name: 'album',
  initialState: {
    byId: {},
    all: [],
    isLoading: false,
  },
  reducers: {
  },
  extraReducers: {
    [createAlbum.pending]: (state) => {
      state.isLoading = true;
    },
    [createAlbum.fulfilled]: (state, action) => {
      state.byId[action.payload.albumId] = action.payload;
      state.all.unshift(action.payload.albumId);
      state.isLoading = false;
    },
    [createAlbum.rejected]: (state) => {
      state.isLoading = false;
    },
  }
})

export default albumSlice.reducer
