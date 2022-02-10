import { useCallback, useEffect, useState } from 'react';
import { get } from '../base';
import { defaultParams } from '../base/axios';
import { serializeToQuery } from '../base/helper';
import { GetOffersRequestPayload, Offer, OffersResponse, UseFetchOffersProps } from './types';

const endpoint = '/Offers';

export const getOffers = (payload: GetOffersRequestPayload) => get<OffersResponse>(endpoint + serializeToQuery(payload));

export const useFetchOffers = (props: UseFetchOffersProps) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersCount, setOffersCount] = useState<number>(0);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isFetchingError, setIsFetchingError] = useState<boolean>(false);

  const fetch = useCallback((payload: GetOffersRequestPayload) => {
    getOffers(payload).then((response) => {
      if (response.status === 200) {
        setOffers(response.data.items);
        setOffersCount(response.data.itemsCount);
        setIsFetching(false);
      } else {
        setIsFetchingError(true);
      }
    });
  }, []);

  useEffect(() => {
    fetch({ ...props, page: 1 });
  }, []);

  return {
    offers,
    offersCount,
    isFetching,
    isFetchingError,
    fetchMore: fetch
  };
};
