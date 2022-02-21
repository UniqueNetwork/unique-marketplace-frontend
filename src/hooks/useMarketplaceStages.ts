import { useCallback, useContext, useEffect, useState } from 'react';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import { web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import { useApi } from './useApi';
import { IMarketController, TransactionOptions, TTransaction } from '../api/chainApi/types';
import AccountContext from '../account/AccountContext';
import type { ExtrinsicStatus } from '@polkadot/types/interfaces';
import { TAuctionProps, TFixPriceProps, TTransfer } from '../pages/Token/Modals/types';


export enum MarketType {
  default = 'Not started', // initial state
  purchase = 'Purchase', // fix price
  bid = 'Bid',
  sellFix = 'Sell for fixed price',
  cancelSellFix = 'Cancellation sell',
  sellAuction = 'Auction',
  transfer = 'Transfer'
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

export type TInternalStageActionParams = {
  account: string,
  tokenId: number,
  collectionId: string,
  txParams: TTxParams,
  options: TransactionOptions
}

export type TInternalStageAction = (params: TInternalStageActionParams) => Promise<TTransaction | void>;
export interface InternalStage extends Stage {
  // if transaction is returned we will initiate sign procedure, otherwise continue with next stage
  action: TInternalStageAction
}

export type useMarketplaceStagesReturn = {
  stages: Stage[],
  initiate: () => void,
  status: StageStatus, // status for all stages combined, not for current stage
  error: Error | undefined | null
}

// todo: auction | fixPrice objects to be provided
// all the extra stuff (min step for bids, price, etc)
export type TTxParams = {
  auction?: TAuctionProps,
  sellFix?: TFixPriceProps,
  transfer?: TTransfer
};

const SUBMIT_RPC = jsonrpc.author.submitAndWatchExtrinsic;

export type Signer = {
  status: 'init' | 'awaiting' | 'done' | 'error'
  tx: TTransaction,
  onSign: (signedTx: TTransaction) => void,
  onError: (error: Error) => void
};

// TODO: into own file
const getInternalStages = (type: MarketType, marketApi?: IMarketController | undefined): InternalStage[] => {
  const bidStages = [] as InternalStage[];
  const sellAuctionStages = [] as InternalStage[];
  // TODO: added for debug, should be taken from hook
  const sellFixStages = [{
    title: 'Add to WhiteList',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams) => marketApi?.addToWhiteList(params.account, params.options)
  },
  {
    title: 'Locking NFT for sale',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams) => marketApi?.lockNftForSale(params.account, params.collectionId, params.tokenId.toString(), params.options)
  },
  {
    title: 'Sending NFT to Smart contract',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams) => marketApi?.sendNftToSmartContract(params.account, params.collectionId, params.tokenId.toString(), params.options)
  },
  {
    title: 'Setting price',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams) => marketApi?.setForFixPriceSale(params.account, params.collectionId, params.tokenId.toString(), params?.txParams?.sellFix?.price || -1, params.options)
  }] as InternalStage[];

  const purchaseStages = [{
    title: 'Place a deposit',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams) => marketApi?.addDeposit(params.account, params.collectionId, params.tokenId.toString(), params.options)
  },
  {
    title: 'Buy token',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams) => marketApi?.buyToken(params.account, params.collectionId, params.tokenId.toString(), params.options)
  }] as InternalStage[];

  const transferStages = [{
    title: 'Transfer token',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams) => marketApi?.transferToken(params.account, params.txParams?.transfer?.recipient || '', params.collectionId, params.tokenId.toString(), params.options)
  }] as InternalStage[];


  const cancelSellFixStages = [{
    title: 'Cancel sale of NFT',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams) => marketApi?.cancelSell(params.account, params.collectionId, params.tokenId.toString(), params.options)
  }] as InternalStage[];

  switch (type) {
    case MarketType.bid:
      return bidStages;
    case MarketType.sellFix:
      return sellFixStages;
    case MarketType.cancelSellFix:
      return cancelSellFixStages;
    case MarketType.sellAuction:
      return sellAuctionStages;
    case MarketType.purchase:
      return purchaseStages;
    case MarketType.transfer:
      return transferStages;
    case MarketType.default:
    default:
      throw new Error(`Incorrect stage type received ${type}`);
  }
};

// TODO: txParams depends on stage type (it is usually a price, but for auction it could contain some extra params like minBid)
const useMarketplaceStages = (type: MarketType, collectionId: string, tokenId: number, txParams: TTxParams): useMarketplaceStagesReturn => {
  // TODO: marketApi should be taken from rpcClient
  const { api } = useApi();
  const { selectedAccount } = useContext(AccountContext);

  const marketApi = api?.market;

  const [internalStages, setInternalStages] = useState<InternalStage[]>(getInternalStages(type, marketApi));
  const [marketStagesStatus, setMarketStagesStatus] = useState<StageStatus>(StageStatus.default);
  const [executionError, setExecutionError] = useState<Error | undefined | null>(null);

  useEffect(() => {
    return () => {
      internalStages?.forEach((internalStage) => internalStage?.signer?.onError(new Error('Componen\'t unmounted')));
    };
  }, [internalStages]);

  const updateStage = useCallback((index: number, newStage: InternalStage) => {
    const copy = [...internalStages];
    copy[index] = newStage;
    setInternalStages(copy);
  }, [internalStages, setInternalStages]);

  const getSignFunction = useCallback((index: number, internalStage: InternalStage) => {
    const sign = (tx: TTransaction): Promise<TTransaction | void> => {
      updateStage(index, { ...internalStage, status: StageStatus.awaitingSign });
      return new Promise<TTransaction>(async (resolve, reject) => {
        // const targetStage = { ...internalStage };
        // targetStage.status = StageStatus.awaitingSign;
        // targetStage.signer = {
        //   tx,
        //   status: 'awaiting',
        //   onSign: (signedTx: TTransaction) => resolve(signedTx),
        //   onError: (error: Error = new Error('Sign failed or aborted')) => reject(error)
        // };
        // updateStage(index, targetStage);

        if (!selectedAccount) throw new Error('Invalid account');
        try {
          const injector = await web3FromSource(selectedAccount.meta.source);
          const signedTx = await tx.signAsync(selectedAccount.address, { signer: injector.signer })
          updateStage(index, { ...internalStage, status: StageStatus.inProgress });
          resolve(signedTx);
        } catch (e) {
          reject(e);
        }
        // TODO: action of update happens inside "get" function, consider renaming or restructuring
      });
    };
    return sign;
  }, [updateStage, selectedAccount]);

  const executeStep = useCallback(async (stage: InternalStage, index: number) => {
    updateStage(index, { ...stage, status: StageStatus.inProgress });
    try {
      // if sign is required by action -> promise wouldn't be resolved until transaction is signed
      // transaction sign should be triggered in the component that uses current stage (you can track it by stage.status or stage.signer)
      await stage.action({ account: selectedAccount?.address || '', collectionId, tokenId, txParams, options: { sign: getSignFunction(index, stage) } });
      updateStage(index, { ...stage, status: StageStatus.success });
    } catch (e) {
      updateStage(index, { ...stage, status: StageStatus.error });
      console.error('Execute stage failed', stage, e);
      throw new Error(`Execute stage "${stage.title}" failed`);
    }
  }, [selectedAccount, collectionId, tokenId, updateStage, getSignFunction]);

  const initiate = useCallback(async () => {
    setMarketStagesStatus(StageStatus.inProgress);
    for (const [index, internalStage] of internalStages.entries()) {
      try {
        await executeStep(internalStage, index);
      } catch (e) {
        setMarketStagesStatus(StageStatus.error);
        setExecutionError(new Error(`Stage "${internalStage.title}" failed`));
        return;
      }
    }
    setMarketStagesStatus(StageStatus.success);
  }, [executeStep, internalStages]);

  return {
    // we don't want our components to know or have any way to interact with stage.actions, everything else is fine
    // TODO: consider to split them apart like InternalStages = [{ stage, action }, ...] instead
    stages: internalStages.map((internalStage: InternalStage) => {
      const { action, ...other } = internalStage;
      return {
        ...other
      };
    }),
    error: executionError,
    status: marketStagesStatus,
    initiate
  };
};

export default useMarketplaceStages;
