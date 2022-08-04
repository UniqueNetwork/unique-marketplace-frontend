import { useCallback, useState } from 'react';

import { deleteRequest, get, post } from '../base';
import { defaultParams } from '../base/axios';
import { FetchStatus, TCalculateBidParams, TCalculateBidParamsWithNetwork, TCalculatedBid, TDeleteParamsWithNetwork, TPlaceBidParams, TPlaceBidParamsWithNetwork, TSignature, TStartAuctionParams, TStartAuctionParamsWithNetwork, TWithdrawBidsParamsWithNetwork, TWithdrawBidsResponse, TWithdrawChooseBidsParamsWithNetwork } from './types';
import { useApi } from '../../../hooks/useApi';

const endpoint = '/api/auction';

export const startAuctionRequest = (body: TStartAuctionParamsWithNetwork) => post<TStartAuctionParamsWithNetwork>(`${endpoint}/create_auction`, body, { ...defaultParams });
export const placeBidRequest = (body: TPlaceBidParamsWithNetwork) => post<TPlaceBidParamsWithNetwork>(`${endpoint}/place_bid`, body, { ...defaultParams });
export const withdrawBid = (body: TDeleteParamsWithNetwork, { signer, signature }: TSignature) => deleteRequest(`${endpoint}/withdraw_bid`, { headers: { ...defaultParams.headers, Authorization: `${signer}:${signature}` }, params: body, ...defaultParams });
export const cancelAuction = (body: TDeleteParamsWithNetwork, { signer, signature }: TSignature) => deleteRequest(`${endpoint}/cancel_auction`, { headers: { ...defaultParams.headers, Authorization: `${signer}:${signature}` }, params: body, ...defaultParams });
export const calculate = (body: TCalculateBidParamsWithNetwork) => post<TCalculateBidParamsWithNetwork, TCalculatedBid>(`${endpoint}/calculate`, body, { ...defaultParams });
export const getWithdrawBids = (body: TWithdrawBidsParamsWithNetwork) => get<TWithdrawBidsResponse>(`${endpoint}/withdraw_bids`, { ...defaultParams, params: body });
export const withdrawChooseBids = ({ auctionIds, timestamp }: TWithdrawChooseBidsParamsWithNetwork, { signer, signature }: TSignature) => deleteRequest(`${endpoint}/withdraw_choose_bid?${auctionIds}&timestamp=${timestamp}`, { headers: { ...defaultParams.headers, Authorization: `${signer}:${signature}` }, ...defaultParams });

export const useAuction = () => {
  const [startAuctionStatus, setStartAuctionStatus] = useState<FetchStatus>(FetchStatus.default);
  const [placeBidStatus, setPlaceBidStatus] = useState<FetchStatus>(FetchStatus.default);
  const [calculateBidStatus, setCalculateBidStatus] = useState<FetchStatus>(FetchStatus.default);
  const { currentChainId = 'unique' } = useApi();

  const startAuction = useCallback(async (params: TStartAuctionParams) => {
    try {
      setStartAuctionStatus(FetchStatus.inProgress);
      await startAuctionRequest({ ...params, network: currentChainId });
      setStartAuctionStatus(FetchStatus.success);
    } catch (e) {
      setStartAuctionStatus(FetchStatus.error);
      console.error('Failed to create auction', e);
    }
  }, [currentChainId]);

  const placeBid = useCallback(async (params: TPlaceBidParams) => {
    try {
      setPlaceBidStatus(FetchStatus.inProgress);
      await placeBidRequest({ ...params, network: currentChainId });
      setPlaceBidStatus(FetchStatus.success);
    } catch (e) {
      setPlaceBidStatus(FetchStatus.error);
      console.error('Failed to place a bid', e);
    }
  }, [currentChainId]);

  const getCalculatedBid = useCallback(async (params: TCalculateBidParams) => {
    try {
      setCalculateBidStatus(FetchStatus.inProgress);
      const { data } = await calculate({ ...params, network: currentChainId });
      setCalculateBidStatus(FetchStatus.success);
      return data;
    } catch (e) {
      setCalculateBidStatus(FetchStatus.error);
      console.error('Failed to calculate bid', e);
    }
  }, [currentChainId]);

  return {
    startAuction,
    placeBid,
    startAuctionStatus,
    placeBidStatus,
    getCalculatedBid,
    calculateBidStatus
  };
};
