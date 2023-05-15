import { useCallback, useState } from 'react';
import { AxiosError } from 'axios';

import { get } from '../base';
import { defaultParams } from '../base/axios';
import { ResponseError } from '../base/types';
import { GetTradesRequestPayload, Trade, TradesResponse } from './types';
import { useApi } from '../../../hooks/useApi';

const endpoint = '/trades';

export const getTrades = (baseURL: string, { seller, ...payload }: GetTradesRequestPayload) => get<TradesResponse>(`${endpoint}${seller ? '/' + seller : ''}`, { ...defaultParams, baseURL, params: payload });

export const useTrades = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tradesCount, setTradesCount] = useState<number>(0);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchingError, setFetchingError] = useState<ResponseError | undefined>();
  const { baseURL } = useApi();

  const fetch = useCallback(async (payload: GetTradesRequestPayload) => {
    setIsFetching(true);
    try {
      const response = await getTrades(baseURL, payload);
      if (response.status === 200) {
        setTrades(response.data.items);
        setTradesCount(response.data.itemsCount);
        setIsFetching(false);
      }
    } catch (err) {
      setFetchingError({
        status: (err as AxiosError).response?.status,
        message: (err as AxiosError).message
      });
    }
  }, [baseURL]);

  return {
    trades,
    tradesCount,
    isFetching,
    fetchingError,
    fetch
  };
};
