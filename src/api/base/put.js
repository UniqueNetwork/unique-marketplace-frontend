import axios, { defaultParams } from './axios';

const put = (url, body, params = { ...defaultParams }) => axios.put(url, body, params);

export default put;
