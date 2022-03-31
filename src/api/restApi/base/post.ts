import { AxiosResponse } from 'axios';
import axios, { defaultParams } from './axios';

const post = <T = any, R = any>(url: string, body: T, params = { ...defaultParams }) => axios.post<T, AxiosResponse<R>>(url, body, params);

export default post;
