import axios, { defaultParams } from './axios';

const post = (url, body, params = { ...defaultParams }) => axios.post(url, body, params);

export default post;
