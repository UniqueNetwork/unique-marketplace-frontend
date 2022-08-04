import { useCallback, useState } from 'react';
import { AxiosError } from 'axios';

import { get } from '../base';
import { defaultParams } from '../base/axios';
import { ResponseError } from '../base/types';
import { TradeDetails } from './types';
import { useApi } from '../../../hooks/useApi';

const endpoint = '/api/Trades/auction';

export const getTradesByAuction = (offerId: string, currentChainId: string) => get(`${endpoint}/${offerId}`, { ...defaultParams, params: { network: currentChainId } });

export const useTradeDetails = () => {
  const [tradeDetails, setTradeDetails] = useState<TradeDetails>();
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchingError, setFetchingError] = useState<ResponseError | undefined>();
  const { currentChainId = 'unique' } = useApi();

  const fetch = useCallback((auctionId: string) => {
    setIsFetching(true);
    getTradesByAuction(auctionId, currentChainId).then((response) => {
      if (response.status === 200) {
        setTradeDetails(response.data[0]);
      }
    }).catch((err: AxiosError) => {
      setFetchingError({
        status: err.response?.status,
        message: err.message
      });
    }).finally(() => setIsFetching(false));
  }, [currentChainId]);

  return {
    tradeDetails,
    isFetching,
    fetchingError,
    fetch
  };
};
