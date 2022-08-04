export enum FetchStatus {
  default = 'Default',
  inProgress = 'InProgress',
  success = 'Success',
  error = 'Error'
}

export type TStartAuctionParams = {
  tx: unknown
  days: number
  startPrice: string
  priceStep: string
}
export interface TStartAuctionParamsWithNetwork extends TStartAuctionParams {
  network: string
}

export type TPlaceBidParams = {
  tx: unknown, collectionId: number, tokenId: number
}
export interface TPlaceBidParamsWithNetwork extends TPlaceBidParams {
  network: string
}

export type TDeleteParams = {
  collectionId: number
  tokenId: number
  timestamp: number
}
export interface TDeleteParamsWithNetwork extends TDeleteParams {
  network: string
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
export interface TCalculateBidParamsWithNetwork extends TCalculateBidParams {
  network: string
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
export interface TCalculatedBidWithNetwork extends TCalculatedBid {
  network: string
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
export interface TWithdrawBidWithNetwork extends TWithdrawBid {
  network: string
}

export type TWithdrawBidsResponse = {
  leader: TWithdrawBid[]
  withdraw: TWithdrawBid[]
}

export type TWithdrawChooseBidsParams = {
  timestamp: number
  auctionIds: string
}
export interface TWithdrawChooseBidsParamsWithNetwork extends TWithdrawChooseBidsParams {
  network: string
}
