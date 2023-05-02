import { AxiosResponse } from 'axios';
import axios, { defaultParams } from './axios';

const patch = <T = any, R = any>(url: string, body: T, params = { ...defaultParams }) => axios.patch<T, AxiosResponse<R>>(url, body, params);

export default patch;
