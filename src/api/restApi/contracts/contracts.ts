import { get } from '../base';
import { defaultParams } from '../base/axios';
import { MarketContractAbiItem } from '../settings/types';

export const getContractsAbi = async (baseURL: string) => {
  try {
    return await get<Record<string, MarketContractAbiItem[]>>('/contracts/abi', { ...defaultParams, baseURL });
  } catch (e) {
    return { data: {}, status: 200 };
  }
};
