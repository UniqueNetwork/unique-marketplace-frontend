import { useCallback, useState } from 'react';

import { get, post } from '../base';
import { defaultParams } from '../base/axios';
import { Settings, WhitelistBody } from './types';
import { ResponseError } from '../base/types';
import { AxiosError } from 'axios';
import { Chain } from 'utils/configParser';

const endpoint = '/settings';

export const getSettings = (baseURL: string) => get<Settings>(`${endpoint}`, { ...defaultParams, baseURL });

export const addToWhitelist = (baseURL: string, body: WhitelistBody, signature: string) => post(`${endpoint}/allowed_list/${body.account}`, null, { headers: { ...defaultParams.headers, Authorization: `Bearer ${signature}` }, ...defaultParams, baseURL });

export const useSettings = () => {
  const [isFetching, setIsFetching] = useState<boolean | undefined>(false);
  const [fetchingError, setFetchingError] = useState<ResponseError | undefined>();

  const fetchSettings = useCallback(async (blockchains: Record<string, Chain>) => {
    setIsFetching(true);
    try {
      const settingsSet = await Promise.all(Object.values(blockchains).map(async (blockchain) => {
        const { data: settings, status } = await getSettings(blockchain.apiEndpoint);
        if (status === 200) {
          return { ...blockchain, networkId: blockchain.network.toLowerCase(), settings };
        }
      }));

      setIsFetching(false);
      return settingsSet.filter((settings) => !!settings) as (Chain & { networkId: string, settings: Settings })[];
    } catch (error) {
      setFetchingError(error as AxiosError);
      setIsFetching(false);
      return [];
    }
  }, []);

  return {
    isFetching,
    fetchingError,
    fetchSettings
  };
};
