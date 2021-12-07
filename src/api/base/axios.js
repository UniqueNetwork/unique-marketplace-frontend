import axios from 'axios';

const axiosInstance = axios;

// apiUrl should be manually provided for any API call, but if we decide that 99% of our calls are internal API we can simply put it as default domain
// TODO: take url from config
export const apiUrl = '/api/v1';

// we can put some default params here for future (ex. cookies/headers)
export const defaultParams = {
  // headers: { Authorization: localStorage.getItem('token') },
};

export default axiosInstance;
