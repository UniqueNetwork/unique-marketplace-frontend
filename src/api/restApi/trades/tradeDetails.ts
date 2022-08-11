import { useCallback, useState } from 'react';
import { AxiosError } from 'axios';

import { get } from '../base';
import { defaultParams } from '../base/axios';
import { ResponseError } from '../base/types';
import { TradeDetails } from './types';

const endpoint = '/api/Trades/auction';

export const getTradesByAuction = (offerId: string) => get(`${endpoint}/${offerId}`, { ...defaultParams });

export const useTradeDetails = () => {
  const [tradeDetails, setTradeDetails] = useState<TradeDetails>();
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchingError, setFetchingError] = useState<ResponseError | undefined>();

  const fetch = useCallback((auctionId: string) => {
    setIsFetching(true);
    getTradesByAuction(auctionId).then((response) => {
      if (response.status === 200) {
        setTradeDetails(response.data[0]);
      }
    }).catch((err: AxiosError) => {
      setFetchingError({
        status: err.response?.status,
        message: err.message
      });
    }).finally(() => setIsFetching(false));
  }, []);

  return {
    tradeDetails,
    isFetching,
    fetchingError,
    fetch
  };
};
