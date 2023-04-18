import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';

import { get } from '../base';
import { Offer, OfferResponse } from './types';
import { defaultParams } from '../base/axios';
import { ResponseError } from '../base/types';
import { useApi } from 'hooks/useApi';

const endpoint = '/offers';

export const getOfferById = (baseURL: string, offerId: string) => get<OfferResponse>(`${endpoint}/${offerId}`, { ...defaultParams, baseURL });
export const getOffer = (baseURL: string, collectionId: number, tokenId: number) => get<OfferResponse>(`${endpoint}/${collectionId}/${tokenId}`, { ...defaultParams, baseURL });

export const useOffer = (collectionId: number, tokenId: number) => {
  const [offer, setOffer] = useState<Offer>();
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [fetchingError, setFetchingError] = useState<ResponseError | undefined>();
  const { baseURL, currentChainId, api } = useApi();

  const fetch = useCallback(async (collectionId: number, tokenId: number) => {
    setIsFetching(true);
    try {
      const { status, data } = await getOffer(baseURL, collectionId, tokenId);
      if (status === 200) {
        const tokenInChain = await api?.nft?.getToken(collectionId, tokenId);
        if (!tokenInChain) throw new Error('Token doesnt exist');
        // TODO: remove after added to API
        data[0].tokenDescription = { ...tokenInChain, nestingChildTokens: [] };
        setOffer(data[0]);
        setIsFetching(false);
        return data[0];
      }
    } catch (err) {
      const { response, message } = err as AxiosError;
      setOffer(undefined);
      setIsFetching(false);
      setFetchingError({
        status: response?.status,
        message
      });
    }
    return [];
  }, [baseURL, api]);

  useEffect(() => {
    if (!currentChainId) return;
    void fetch(collectionId, tokenId);
  }, [currentChainId, collectionId, tokenId, fetch]);

  return {
    offer,
    isFetching,
    fetchingError,
    fetch
  };
};
