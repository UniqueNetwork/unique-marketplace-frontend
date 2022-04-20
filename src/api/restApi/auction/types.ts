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
  tokenOwner: string
}
export type TPlaceBidParams = {
  tx: unknown, collectionId: number, tokenId: number
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

export type TWithdrawBid = {
  amount: string
  auctionId: string
  collectionId: string
  contractAskId: string
  tokenId: string
};

export type TWithdrawChooseBidsParams = {
  timestamp: number
  auctionIds: string
}
