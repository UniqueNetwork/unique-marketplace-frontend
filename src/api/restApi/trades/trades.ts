import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';

import { get } from '../base';
import { defaultParams } from '../base/axios';
import { ResponseError } from '../base/types';
import { GetTradesRequestPayload, Trade, UseFetchTradesProps } from './types';

const endpoint = '/api/Trades';

export const getTrades = ({ seller, ...payload }: GetTradesRequestPayload) => get(`${endpoint}${seller ? '/' + seller : ''}`, { ...defaultParams, params: payload });

export const useTrades = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tradesCount, setTradesCount] = useState<number>(0);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchingError, setFetchingError] = useState<ResponseError | undefined>();

  const fetch = useCallback((payload: GetTradesRequestPayload) => {
    setIsFetching(true);
    getTrades(payload).then((response) => {
      if (response.status === 200) {
        setTrades(response.data.items);
        setTradesCount(response.data.itemsCount);
        setIsFetching(false);
      }
    }).catch((err: AxiosError) => {
      setFetchingError({
        status: err.response?.status,
        message: err.message
      });
    });
  }, []);

  return {
    trades,
    tradesCount,
    isFetching,
    fetchingError,
    fetch
  };
};
