import { get, post } from './base';
import { apiUrl } from './base/axios';

const getExample = (params = { currency: 'USD' }) => get('https://api.coinbase.com/v2/prices/spot', params);
const postExample = (id: Number, data: any) => post(`${apiUrl}/create/${id}`, data);

export default {
  getExample,
  postExample
}