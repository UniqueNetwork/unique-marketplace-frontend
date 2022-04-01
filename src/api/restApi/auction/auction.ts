import { useCallback, useState } from 'react';

import { deleteRequest, post } from '../base';
import { defaultParams } from '../base/axios';
import { FetchStatus, TCalculateBidParams, TCalculatedBid, TDeleteParams, TPlaceBidParams, TSignature, TStartAuctionParams } from './types';

const endpoint = '/auction';

export const startAuction = (body: TStartAuctionParams) => post<TStartAuctionParams>(`${endpoint}/create_auction`, body, { ...defaultParams });
export const placeBid = (body: TPlaceBidParams) => post<TPlaceBidParams>(`${endpoint}/place_bid`, body, { ...defaultParams });
export const withdrawBid = (body: TDeleteParams, { signer, signature }: TSignature) => deleteRequest(`${endpoint}/withdraw_bid`, { headers: { ...defaultParams.headers, Authorization: `${signer}:${signature}` }, params: body, ...defaultParams });
export const cancelAuction = (body: TDeleteParams, { signer, signature }: TSignature) => deleteRequest(`${endpoint}/cancel_auction`, { headers: { ...defaultParams.headers, Authorization: `${signer}:${signature}` }, params: body, ...defaultParams });
export const calculate = (body: TCalculateBidParams) => post<TCalculateBidParams, TCalculatedBid>(`${endpoint}/calculate`, body, { ...defaultParams });

export const useAuction = () => {
  const [startAuctionStatus, setStartAuctionStatus] = useState<FetchStatus>(FetchStatus.default);
  const [placeBidStatus, setPlaceBidStatus] = useState<FetchStatus>(FetchStatus.default);
  const [calculateBidStatus, setCalculateBidStatus] = useState<FetchStatus>(FetchStatus.default);
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
      console.error('Failed to place a bid', e);
    }
  }, []);

  const getCalculatedBid = useCallback(async (params: TCalculateBidParams) => {
    try {
      setCalculateBidStatus(FetchStatus.inProgress);
      const { data } = await calculate(params);
      setCalculateBidStatus(FetchStatus.success);
      return data;
    } catch (e) {
      setCalculateBidStatus(FetchStatus.error);
      console.error('Failed to calculate bid', e);
    }
  }, []);

  return {
    startAuction,
    placeBid,
    startAuctionStatus,
    placeBidStatus,
    getCalculatedBid,
    calculateBidStatus
  };
};
