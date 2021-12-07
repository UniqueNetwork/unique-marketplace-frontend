import axios, { defaultParams } from './axios';

const get = (url, params = { ...defaultParams }) => axios.get(url, params);

export default get;
