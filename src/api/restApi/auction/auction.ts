import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';

import { post, get } from '../base';
import { Offer } from './types';
import { defaultParams } from '../base/axios';
import { ResponseError } from '../base/types';

const endpoint = '/offer';

export enum FetchStatus {
  default = 'Default',
  inProgress = 'InProgress',
  success = 'Success',
  error = 'Error'
}

export type TStartAuctionParams = {
  tx: unknown, days: number, startPrice: string, priceStep: string
}

export type TPlaceBidParams = {
  tx: unknown, collectionId: number, tokenId: number
}

export const startAuction = (body: TStartAuctionParams) => post<TStartAuctionParams>(`${endpoint}/auction/create_auction`, body, { ...defaultParams });
export const placeBid = (body: TPlaceBidParams) => post<TPlaceBidParams>(`${endpoint}/auction/auction/place_bid`, body, { ...defaultParams });

export const useAuction = () => {
  const [startAuctionStatus, setStartAuctionStatus] = useState<FetchStatus>(FetchStatus.default);
  const [placeBidStatus, setPlaceBidStatus] = useState<FetchStatus>(FetchStatus.default);
  const startAuction = useCallback(async (params: TStartAuctionParams) => {
    try {
      setStartAuctionStatus(FetchStatus.inProgress);
      await startAuction(params);
      setStartAuctionStatus(FetchStatus.success);
    } catch (e) {
      setStartAuctionStatus(FetchStatus.error);
      console.error('Failed to create auction', e);
    }
  }, []);

  const placeBid = useCallback(async (params: TPlaceBidParams) => {
    try {
      setPlaceBidStatus(FetchStatus.inProgress);
      await placeBid(params);
      setPlaceBidStatus(FetchStatus.success);
    } catch (e) {
      setPlaceBidStatus(FetchStatus.error);
      console.error('Failed to create auction', e);
    }
  }, []);

  return {
    startAuction,
    placeBid,
    startAuctionStatus,
    placeBidStatus
  };
};
