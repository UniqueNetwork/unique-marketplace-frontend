import { useCallback, useEffect, useState } from 'react';

import { get } from '../base';
import { defaultParams } from '../base/axios';
import { serializeToQuery } from '../base/helper';
import { QueryParams } from '../base/types';
import { GetTradesRequestPayload, Trade, UseFetchTradesProps } from './types';

const endpoint = '/Trades';

export const getTrades = ({ seller, ...payload }: GetTradesRequestPayload) => get(`${endpoint}${seller ? '/' + seller : ''}` + serializeToQuery(payload as unknown as QueryParams));

export const useFetchTrades = (props: UseFetchTradesProps) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tradesCount, setTradesCount] = useState<number>(0);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isFetchingError, setIsFetchingError] = useState<boolean>(false);

  const fetch = useCallback((payload: GetTradesRequestPayload) => {
    getTrades(payload).then((response) => {
      if (response.status === 200) {
        setTrades(response.data.items);
        setTradesCount(response.data.itemsCount);
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
    trades,
    tradesCount,
    isFetching,
    isFetchingError,
    fetchMore: fetch
  };
};
