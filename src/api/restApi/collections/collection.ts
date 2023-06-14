import { useCallback, useState } from 'react';

import { get, patch } from '../base';
import { defaultParams } from '../base/axios';
import { MarketableCollection } from './types';
import { ResponseError } from '../base/types';
import { AxiosError } from 'axios';
import { useApi } from 'hooks/useApi';
import config from 'config';
import { useAccounts } from 'hooks/useAccounts';

const endpoint = '/collections';

export const getCollection = (baseURL: string, collectionId: number) => get<MarketableCollection>(`${endpoint}/${collectionId}`, { ...defaultParams, baseURL });
export const addCollectionToMarket = (baseURL: string, collectionId: number, account?: string) => patch(`${endpoint}/add`, {}, { ...defaultParams, baseURL, params: { force: true, collectionId, account } });

export const useMarketableCollection = () => {
  const [isFetching, setIsFetching] = useState<boolean | undefined>(false);
  const [fetchingError, setFetchingError] = useState<ResponseError | undefined>();
  const { currentChainId } = useApi();
  const { selectedAccount } = useAccounts();

  const fetchCollection = useCallback(async (collectionId: number) => {
    if (!currentChainId) return;
    setIsFetching(true);
    try {
      const { data: collectionData, status } = await getCollection(config.blockchains[currentChainId].apiEndpoint, collectionId);
      if (status === 200) {
        return collectionData;
      }
      setIsFetching(false);
      return undefined;
    } catch (error) {
      setFetchingError(error as AxiosError);
      setIsFetching(false);
      return undefined;
    }
  }, [currentChainId]);

  const addCollection = useCallback(async (collectionId: number) => {
    if (!currentChainId) return;
    setIsFetching(true);
    try {
      const { data: collectionData, status } = await addCollectionToMarket(
        config.blockchains[currentChainId].apiEndpoint,
        collectionId,
        selectedAccount?.address
      );
      if (status === 200) {
        return collectionData;
      }
      setIsFetching(false);
      return;
    } catch (error) {
      setFetchingError(error as AxiosError);
      setIsFetching(false);
      return [];
    }
  }, [currentChainId, selectedAccount?.address]);

  return {
    isFetching,
    fetchingError,
    fetchCollection,
    addCollection
  };
};
