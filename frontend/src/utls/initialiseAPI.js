import axios from "axios";
import _ from "lodash";
import { logout, setToken } from "../redux/auth";
import config from '../config';
import { sendNotification } from "../redux/system";

export default (store) => {

  axios.defaults.timeout = 15000;
  axios.interceptors.request.use(function (config) {
    config.headers.authorization = `Bearer ${_.get(store.getState(), 'auth.token')}`
    return config;
  });
  axios.interceptors.response.use(response => {
    return response;
  }, error => {
    const status = _.get(error, 'response.status');
    if (status === 401) {
      store.dispatch(logout());
    } else if (status >= 400 && status < 500 || error.code === 'ECONNABORTED') {
      store.dispatch(sendNotification({ type: 'warn', content: error.message }))
    } else {
      store.dispatch(sendNotification({ type: 'error', content: 'Something went wrong' }))
    }
    return Promise.reject(error);
  });

  axios.defaults.baseURL = config.backendUrl;

  const token = window.localStorage.getItem("token");
  if (token) {
    store.dispatch(setToken(token));
  }
}
