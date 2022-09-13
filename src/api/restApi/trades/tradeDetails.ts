import { useCallback, useState } from 'react';
import { AxiosError } from 'axios';

import { get } from '../base';
import { defaultParams } from '../base/axios';
import { ResponseError } from '../base/types';
import { TradeDetails, TradeDetailsResponse } from './types';
import { useApi } from '../../../hooks/useApi';

const endpoint = '/api/Trades/auction';

export const getTradesByAuction = (baseURL: string, offerId: string) => get<TradeDetailsResponse>(`${endpoint}/${offerId}`, { ...defaultParams, baseURL });

export const useTradeDetails = () => {
  const [tradeDetails, setTradeDetails] = useState<TradeDetails>();
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchingError, setFetchingError] = useState<ResponseError | undefined>();
  const { baseURL } = useApi();

  const fetch = useCallback(async (auctionId: string) => {
    setIsFetching(true);
    try {
      const response = await getTradesByAuction(baseURL, auctionId);
      if (response.status === 200) {
        setTradeDetails(response.data[0]);
      }
    } catch (err) {
      setFetchingError({
        status: (err as AxiosError).response?.status,
        message: (err as AxiosError).message
      });
    }
    setIsFetching(false);
  }, [baseURL]);

  return {
    tradeDetails,
    isFetching,
    fetchingError,
    fetch
  };
};
