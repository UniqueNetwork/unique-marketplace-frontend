import { TransactionOptions, TTransaction } from '../api/uniqueSdk/types';
import { UnsignedTxPayload } from '@unique-nft/sdk/types';

export enum StageStatus {
  default = 'Default',
  inProgress = 'InProgress',
  awaitingSign = 'Awaiting for transaction sign',
  success = 'Success',
  error = 'Error'
}

export type Signer = {
  status: 'init' | 'awaiting' | 'done' | 'error'
  tx: TTransaction,
  onSign: (signedTx: TTransaction) => void,
  onError: (error: Error) => void
};
export type Stage = {
  title: string;
  description?: string;
  status: StageStatus;
  signer?: Signer;
  error?: Error;
};
export type useStagesReturn<T> = {
  stages: Stage[],
  initiate: (params: T) => Promise<void>,
  status: StageStatus, // status for all stages combined, not for current stage
  error: Error | undefined | null
}
export type TInternalStageActionParams<T> = {
  txParams: T,
  options: TransactionOptions
};
export type TInternalStageAction<T> = (params: TInternalStageActionParams<T>) => Promise<TTransaction | void> | undefined;

export interface InternalStage<T> extends Stage {
  // if transaction is returned we will initiate sign procedure, otherwise continue with next stage
  action: TInternalStageAction<T>
}

export type ActionFunction<T> = (action: TInternalStageAction<T>, txParams: T, options: TransactionOptions) => Promise<TTransaction | void>;
export type SignFunction = (unsignedTxPayload: UnsignedTxPayload) => Promise<`0x${string}` | null>;
