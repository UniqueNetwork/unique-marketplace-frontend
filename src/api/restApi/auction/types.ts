import { SignerPayloadJSON } from '@polkadot/types/types';

export enum FetchStatus {
  default = 'Default',
  inProgress = 'InProgress',
  success = 'Success',
  error = 'Error'
}

export type TStartAuctionParams = {
  signerPayloadJSON?: SignerPayloadJSON,
  signature: `0x${string}`
  days: number
  startPrice: string
  priceStep: string
}

export type TPlaceBidParams = {
  signerPayloadJSON?: SignerPayloadJSON
  signature: `0x${string}`
  collectionId: number
  tokenId: number
}

export type TDeleteParams = {
  collectionId: number
  tokenId: number
  timestamp: number
}

export type TSignature = {
  signature: string,
  signer: string
}
export type TCalculateBidParams = {
  collectionId: number
  tokenId: number
  bidderAddress: string
}

export type TCalculatedBid = {
  // sum of bids from this account
  bidderPendingAmount: string,
  // min bid for this account in order to place a max bid
  minBidderAmount: string,
  // max bid for this auction
  contractPendingPrice: string,
  // step for this auction
  priceStep: string
}

export type TWithdrawBidsParams = {
  owner: string
}
export interface TWithdrawBidsParamsWithNetwork extends TWithdrawBidsParams {
  network: string
}

export type TWithdrawBid = {
  amount: string
  auctionId: string
  collectionId: string
  contractAskId: string
  tokenId: string
};

export type TWithdrawBidsResponse = {
  leader: TWithdrawBid[]
  withdraw: TWithdrawBid[]
}

export type TWithdrawChooseBidsParams = {
  timestamp: number
  auctionIds: string
}
