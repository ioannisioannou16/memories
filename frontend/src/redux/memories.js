import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import _ from 'lodash';

export const fetchMemories = createAsyncThunk(
  'memories/fetchAll',
  async () => {
    const result = await axios.get("/memories");
    return result.data;
  }
);

export const fetchMemory = createAsyncThunk(
  'memories/fetch',
  async (memoryId) => {
    const result = await axios.get(`/memories/${memoryId}`);
    return result.data;
  }
);

export const createMemory = createAsyncThunk(
  'memories/new',
  async () => {
    const result = await axios.post("/memories");
    return result.data;
  }
)

export const updateMemory = createAsyncThunk(
  'memories/update',
  async ({memoryId, ...update}) => {
    const result = await axios.put(`/memories/${memoryId}`, update);
    return result.data;
  }
)

export const deleteMemory = createAsyncThunk(
  'memories/delete',
  async (memoryId) => {
    const result = await axios.delete(`/memories/${memoryId}`);
    return result.data;
  }
)

const memoriesSlice = createSlice({
  name: 'memories',
  initialState: {
    byId: {},
    all: [],
    isFetchingAll: false,
    isCreating: false,
  },
  reducers: {
    addImage(state, action) {
      state.byId[action.payload.memoryId].images.push(action.payload.image);
    },
    deleteImage(state, action) {
      const images = state.byId[action.payload.memoryId].images
      const index = images.findIndex(image => image.imageId === action.payload.imageId);
      if (index !== -1) {
        images.splice(index, 1);
      }
    }
  },
  extraReducers: {
    [fetchMemories.pending]: (state) => {
      state.isLoadingAll = true;
    },
    [fetchMemories.fulfilled]: (state, action) => {
      state.byId = _.keyBy(action.payload, 'memoryId');
      state.all = action.payload.map(m => m.memoryId);
      state.isLoadingAll = false;
    },
    [fetchMemories.rejected]: (state) => {
      state.isLoadingAll = false;
    },
    [createMemory.pending]: (state) => {
      state.isCreating = true;
    },
    [createMemory.fulfilled]: (state, action) => {
      state.byId[action.payload.memoryId] = {
        ...action.payload,
        images: []
      };
      state.all.unshift(action.payload.memoryId);
      state.isCreating = false;
    },
    [createMemory.rejected]: (state) => {
      state.isCreating = false;
    },
    [deleteMemory.pending]: (state, action) => {
      state.byId[action.meta.arg].isDeleting = true;
    },
    [deleteMemory.fulfilled]: (state, action) => {
      delete state.byId[action.payload.memoryId]
      const index = state.all.findIndex(id => id === action.payload.memoryId);
      if (index !== -1) {
        state.all.splice(index, 1)
      }
    },
    [deleteMemory.rejected]: (state, action) => {
      state.byId[action.meta.arg].isDeleting = false
    },
    [updateMemory.pending]: (state, action) => {
      state.byId[action.meta.arg.memoryId].isUpdating = true;
    },
    [updateMemory.fulfilled]: (state, action) => {
      state.byId[action.payload.memoryId] = {
        ...state.byId[action.payload.memoryId],
        ...action.payload,
        isUpdating: false
      };
    },
    [updateMemory.rejected]: (state, action) => {
      state.byId[action.meta.arg.memoryId].isUpdating = false
    },
    [fetchMemory.fulfilled]: (state, action) => {
      state.byId[action.payload.memoryId] = action.payload;
    },
  }
})

export const { addImage, deleteImage } = memoriesSlice.actions

export default memoriesSlice.reducer
