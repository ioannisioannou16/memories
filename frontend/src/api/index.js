import axios from 'axios';
import _ from 'lodash';
import config from '../config';
import { logout } from "../redux/auth";

const BASE_URL = config.backendUrl;

const initialise = (store) => {
  axios.interceptors.request.use(function (config) {
    config.headers.authorization = `Bearer ${_.get(store.getState(), 'auth.token')}`
    return config;
  });
  axios.interceptors.response.use(response => {
    return response;
  }, error => {
    if (error.response.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  });
}

const generateUploadUrl = async (body) => {
  const result = await axios.post(`${BASE_URL}/generate-upload-url`, body)
  return result.data.uploadUrl;
}

const createAlbum = async () => {
  const result = await axios.post(`${BASE_URL}/album`)
  return result.data;
}

const fetchAlbum = async (albumId) => {
  const result = await axios.get(`${BASE_URL}/album/${albumId}`)
  return result.data;
}

const deleteAlbum = async (albumId) => {
  const result = await axios.delete(`${BASE_URL}/album/${albumId}`)
  return result.data;
}

export default {
  initialise,
  generateUploadUrl,
  createAlbum,
  fetchAlbum,
  deleteAlbum
}
