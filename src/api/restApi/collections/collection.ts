import { useCallback, useState } from 'react';

import { get, patch } from '../base';
import { defaultParams } from '../base/axios';
import { MarketableCollection, MarketableCollectionMetadata } from './types';
import { ResponseError } from '../base/types';
import { AxiosError } from 'axios';
import { useApi } from 'hooks/useApi';
import config from 'config';
import { useAccounts } from 'hooks/useAccounts';
import { Address } from '@unique-nft/utils';

const endpoint = '/collections';

export const getCollection = (baseURL: string, collectionId: number) => get<MarketableCollection>(`${endpoint}/${collectionId}`, { ...defaultParams, baseURL });
export const addCollectionToMarket = (baseURL: string, collectionId: number, account?: string) => patch(`${endpoint}/add`, {}, { ...defaultParams, baseURL, params: { collectionId, account } });
export const updateCollectionMetadata = (baseURL: string, collectionId: number, account: string, type: 'keyring' | 'metamask', metadata: MarketableCollectionMetadata, signature: string) =>
  patch(`${endpoint}/metadata/${collectionId}`, { metadata }, {
    ...defaultParams,
    params: {
      account,
      type
    },
    headers: { ...defaultParams.headers, Authorization: `Bearer ${signature}` },
    baseURL
  });

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

  const updateCollection = useCallback(async (collectionId: number, metadata: MarketableCollectionMetadata, type: 'keyring' | 'metamask', signedData: { signature: string, message: string }) => {
    if (!currentChainId) return;
    setIsFetching(true);
    try {
      const signature = type === 'metamask'
        ? btoa(JSON.stringify({
                ...signedData,
                metamask: selectedAccount?.address
              }))
        : signedData.signature;

      const address = selectedAccount?.address && Address.is.ethereumAddressInAnyForm(selectedAccount.address)
        ? selectedAccount.address
        : selectedAccount?.address || '';

      const { status } = await updateCollectionMetadata(
        config.blockchains[currentChainId].apiEndpoint,
        collectionId,
        address,
        type,
        metadata,
        signature
      );
      if (status === 200) {
        return;
      }
      setIsFetching(false);
      throw new Error('Failed update collection metadata');
    } catch (error) {
      setFetchingError(error as AxiosError);
      setIsFetching(false);
      throw new Error('Failed update collection metadata');
    }
  }, [selectedAccount, currentChainId]);

  return {
    isFetching,
    fetchingError,
    fetchCollection,
    addCollection,
    updateCollection
  };
};
