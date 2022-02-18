import { TransactionOptions, TTransaction } from '../api/chainApi/types';

export enum MarketType {
  default = 'Not started', // initial state
  purchase = 'Purchase', // fix price
  bid = 'Bid',
  sellFix = 'Sell for fixed price',
  sellAuction = 'Auction',
  transfer = 'Transfer',
  delist = 'Cancel sell'
}

export enum StageStatus {
  default = 'Default',
  inProgress = 'InProgress',
  awaitingSign = 'Awaiting for transaction sign',
  success = 'Success',
  error = 'Error'
}

export type Stage = {
  title: string;
  description?: string;
  status: StageStatus;
  signer?: Signer;
  error?: Error;
};

export type TInternalStageActionParams<T> = {
  account: string,
  tokenId: string,
  collectionId: string,
  txParams: T,
  options: TransactionOptions
}

export type TInternalStageAction<T> = (params: TInternalStageActionParams<T>) => Promise<TTransaction | void>;
export interface InternalStage<T> extends Stage {
  // if transaction is returned we will initiate sign procedure, otherwise continue with next stage
  action: TInternalStageAction<T>
}

export type useMarketplaceStagesReturn<T> = {
  stages: Stage[],
  initiate: (params: T) => void,
  status: StageStatus, // status for all stages combined, not for current stage
  error: Error | undefined | null
}

export type Signer = {
  status: 'init' | 'awaiting' | 'done' | 'error'
  tx: TTransaction,
  onSign: (signedTx: TTransaction) => void,
  onError: (error: Error) => void
};
