import axios, { defaultParams } from './axios';

const post = (url: string, body: Record<string, any>, params = { ...defaultParams }) => axios.post(url, body, params);

export default post;
