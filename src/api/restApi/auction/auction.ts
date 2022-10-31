import { useCallback, useState } from 'react';

import { deleteRequest, get, post } from '../base';
import { defaultParams } from '../base/axios';
import { FetchStatus, TCalculateBidParams, TCalculatedBid, TDeleteParams, TPlaceBidParams, TSignature, TStartAuctionParams, TWithdrawBidsParams, TWithdrawBidsResponse, TWithdrawChooseBidsParams } from './types';
import { useApi } from 'hooks/useApi';

const endpoint = '/api/auction';

export const startAuctionRequest = (baseURL: string, body: TStartAuctionParams) => post<TStartAuctionParams>(`${endpoint}/create_auction`, body, { ...defaultParams, baseURL });
export const placeBidRequest = (baseURL: string, body: TPlaceBidParams) => post<TPlaceBidParams>(`${endpoint}/place_bid`, body, { ...defaultParams, baseURL });
export const withdrawBid = (baseURL: string, body: TDeleteParams, { signer, signature }: TSignature) => deleteRequest(`${endpoint}/withdraw_bid`, { headers: { ...defaultParams.headers, Authorization: `${signer}:${signature}` }, params: body, ...defaultParams, baseURL });
export const cancelAuction = (baseURL: string, body: TDeleteParams, { signer, signature }: TSignature) => deleteRequest(`${endpoint}/cancel_auction`, { headers: { ...defaultParams.headers, Authorization: `${signer}:${signature}` }, params: body, ...defaultParams, baseURL });
export const calculate = (baseURL: string, body: TCalculateBidParams) => post<TCalculateBidParams, TCalculatedBid>(`${endpoint}/calculate`, body, { ...defaultParams, baseURL });
export const getWithdrawBids = (baseURL: string, body: TWithdrawBidsParams) => get<TWithdrawBidsResponse>(`${endpoint}/withdraw_bids`, { ...defaultParams, params: body, baseURL });
export const withdrawChooseBids = (baseURL: string, { auctionIds, timestamp }: TWithdrawChooseBidsParams, { signer, signature }: TSignature) => deleteRequest(`${endpoint}/withdraw_choose_bid?${auctionIds}&timestamp=${timestamp}`, { headers: { ...defaultParams.headers, Authorization: `${signer}:${signature}` }, ...defaultParams, baseURL });

export const useAuction = () => {
  const [startAuctionStatus, setStartAuctionStatus] = useState<FetchStatus>(FetchStatus.default);
  const [placeBidStatus, setPlaceBidStatus] = useState<FetchStatus>(FetchStatus.default);
  const [calculateBidStatus, setCalculateBidStatus] = useState<FetchStatus>(FetchStatus.default);
  const { baseURL } = useApi();

  const startAuction = useCallback(async (params: TStartAuctionParams) => {
    try {
      setStartAuctionStatus(FetchStatus.inProgress);
      await startAuctionRequest(baseURL, { ...params });
      setStartAuctionStatus(FetchStatus.success);
    } catch (e) {
      setStartAuctionStatus(FetchStatus.error);
      console.error('Failed to create auction', e);
    }
  }, [baseURL]);

  const placeBid = useCallback(async (params: TPlaceBidParams) => {
    try {
      setPlaceBidStatus(FetchStatus.inProgress);
      await placeBidRequest(baseURL, { ...params });
      setPlaceBidStatus(FetchStatus.success);
    } catch (e) {
      setPlaceBidStatus(FetchStatus.error);
      console.error('Failed to place a bid', e);
    }
  }, [baseURL]);

  const getCalculatedBid = useCallback(async (params: TCalculateBidParams) => {
    try {
      setCalculateBidStatus(FetchStatus.inProgress);
      const { data } = await calculate(baseURL, { ...params });
      setCalculateBidStatus(FetchStatus.success);
      return data;
    } catch (e) {
      setCalculateBidStatus(FetchStatus.error);
      console.error('Failed to calculate bid', e);
    }
  }, [baseURL]);

  return {
    startAuction,
    placeBid,
    startAuctionStatus,
    placeBidStatus,
    getCalculatedBid,
    calculateBidStatus
  };
};
