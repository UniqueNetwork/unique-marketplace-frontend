import axios, { AxiosRequestConfig } from 'axios';
import config from '../../../config';

const axiosInstance = axios;

// we can put some default params here for future (ex. cookies/headers)
export const defaultParams: AxiosRequestConfig = {
  baseURL: config.uniqueApi
  // headers: { Authorization: localStorage.getItem('token') },
};

export default axiosInstance;
