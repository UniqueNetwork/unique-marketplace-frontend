import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';

import { get } from '../base';
import { defaultParams } from '../base/axios';
import { GetOffersRequestPayload, Offer, OffersResponse, UseFetchOffersProps } from './types';
import { ResponseError } from '../base/types';
import { useApi } from '../../../hooks/useApi';
import { fromStringToBnString } from '../../../utils/bigNum';

const endpoint = '/Offers';

export const getOffers = (payload: GetOffersRequestPayload) => get<OffersResponse>(endpoint, { ...defaultParams, params: payload });

export const useOffers = ({ page = 1, pageSize = 10, ...props }: UseFetchOffersProps) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersCount, setOffersCount] = useState<number>(0);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchingError, setFetchingError] = useState<ResponseError | undefined>();
  const { api } = useApi();

  const fetch = useCallback(({ minPrice, maxPrice, ...payload }: GetOffersRequestPayload) => {
    setIsFetching(true);
    console.log(fromStringToBnString(minPrice || ''));
    getOffers({
      ...payload,
      minPrice: minPrice && fromStringToBnString(minPrice, api?.market?.kusamaDecimals),
      maxPrice: maxPrice && fromStringToBnString(maxPrice, api?.market?.kusamaDecimals)
    }).then((response) => {
      if (response.status === 200) {
        setOffers(response.data.items);
        setOffersCount(response.data.itemsCount);
        setIsFetching(false);
      }
    }).catch((err: AxiosError) => {
      setFetchingError({
        status: err.response?.status,
        message: err.message
      });
    });
  }, [api?.market?.kusamaDecimals]);

  const fetchMore = useCallback(({ minPrice, maxPrice, ...payload }: GetOffersRequestPayload) => {
    setIsFetching(true);
    getOffers({
      ...payload,
      minPrice: minPrice && fromStringToBnString(minPrice, api?.market?.kusamaDecimals),
      maxPrice: maxPrice && fromStringToBnString(maxPrice, api?.market?.kusamaDecimals)
    }).then((response) => {
      if (response.status === 200) {
        setOffers([...offers, ...response.data.items]);
        setIsFetching(false);
      }
    }).catch((err: AxiosError) => {
        setFetchingError({
          status: err.response?.status,
          message: err.message
        });
      });
    }, [offers, api?.market?.kusamaDecimals]);

  return {
    offers,
    offersCount,
    isFetching,
    fetchingError,
    fetch,
    fetchMore
  };
};
