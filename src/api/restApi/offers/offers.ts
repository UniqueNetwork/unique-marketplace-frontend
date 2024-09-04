import { useCallback, useState } from 'react';
import { AxiosError } from 'axios';

import { get } from '../base';
import { defaultParams } from '../base/axios';
import { GetOffersRequestPayload, Offer, OffersResponse } from './types';
import { ResponseError } from '../base/types';
import { useApi } from '../../../hooks/useApi';

const endpoint = '/Offers';

export const getOffers = (baseURL: string, payload: GetOffersRequestPayload) => get<OffersResponse>(endpoint, { ...defaultParams, baseURL, params: payload });

export const emptyResponse: OffersResponse = {
  items: [],
  currentPage: 1,
  itemsPerPage: 20,
  itemCount: 0,
  totalItems: 0,
  totalPages: 0,
};

export const useOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersCount, setOffersCount] = useState<number>(0);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchingError, setFetchingError] = useState<ResponseError | undefined>();
  const { api, baseURL } = useApi();

  const fetch = useCallback(async ({ minPrice, maxPrice, ...payload }: GetOffersRequestPayload) => {
    setIsFetching(true);
    try {
      const { status, data } = await getOffers(baseURL, {
        ...payload,
        minPrice: minPrice,
        maxPrice: maxPrice
      });
      if (status === 200) {
        setOffers(data.items);
        setOffersCount(data.totalItems);
        setIsFetching(false);
        return data;
      }
    } catch (err) {
      const { response, message } = err as AxiosError;
      setFetchingError({
        status: response?.status,
        message
      });
    }
    return emptyResponse;
  }, [baseURL, api?.market?.decimals]);

  const fetchMore = useCallback(async ({ minPrice, maxPrice, ...payload }: GetOffersRequestPayload) => {
    setIsFetching(true);
    try {
      const { status, data } = await getOffers(baseURL, {
        ...payload,
        minPrice: minPrice,
        maxPrice: maxPrice
      });
      if (status === 200) {
        setOffers([...offers, ...data.items]);
        setIsFetching(false);
      }
    } catch (err) {
      const { response, message } = err as AxiosError;
      setFetchingError({
        status: response?.status,
        message
      });
    }
  }, [baseURL, offers, api?.market?.decimals]);

  return {
    offers,
    offersCount,
    isFetching,
    fetchingError,
    fetch,
    fetchMore,
  };
};
