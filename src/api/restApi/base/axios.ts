import axios, { AxiosRequestConfig } from 'axios';
import { serializeToQuery } from './helper';

const axiosInstance = axios;

// we can put some default params here for future (ex. cookies/headers)
export const defaultParams: AxiosRequestConfig = {
  paramsSerializer: serializeToQuery
  // headers: { Authorization: localStorage.getItem('token') },
};

export default axiosInstance;
