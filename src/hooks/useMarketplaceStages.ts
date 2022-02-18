import { useCallback, useContext, useEffect, useState } from 'react';
import { web3FromSource } from '@polkadot/extension-dapp';
import { useApi } from './useApi';
import { IMarketController, TTransaction } from '../api/chainApi/types';
import AccountContext from '../account/AccountContext';
import { InternalStage, MarketType, StageStatus, TInternalStageActionParams, useMarketplaceStagesReturn } from '../types/MarketTypes';
import { TAuctionProps, TFixPriceProps, TTransfer } from '../pages/Token/Modals/types';

// TODO: into own file
const getInternalStages = <T>(type: MarketType, marketApi?: IMarketController | undefined): InternalStage<T>[] => {
  const bidStages = [] as InternalStage<T>[];
  const sellAuctionStages = [] as InternalStage<T>[];
  const sellFixStages = [{
    title: 'Locking NFT for sale',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams<TFixPriceProps>) => marketApi?.lockNftForSale(params.account, params.collectionId, params.tokenId.toString(), params.options)
  },
  {
    title: 'Sending NFT to Smart contract',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams<TFixPriceProps>) => marketApi?.sendNftToSmartContract(params.account, params.collectionId, params.tokenId.toString(), params.options)
  },
  {
    title: 'Setting price',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams<TFixPriceProps>) => marketApi?.setForFixPriceSale(params.account, params.collectionId, params.tokenId.toString(), params?.txParams?.price || -1, params.options)
  }] as InternalStage<any>[]; // TODO: solve this typization riddle

  const purchaseStages = [{
    title: 'Place a deposit',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams<T>) => marketApi?.addDeposit(params.account, params.collectionId, params.tokenId.toString(), params.options)
  },
  {
    title: 'Buy token',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams<T>) => marketApi?.buyToken(params.account, params.collectionId, params.tokenId.toString(), params.options)
  }] as InternalStage<any>[];

  const transferStages = [{
    title: 'Transfer token',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams<TTransfer>) => marketApi?.transferToken(params.account, params.txParams?.recipient || '', params.collectionId, params.tokenId.toString(), params.options)
  }] as InternalStage<any>[];

  switch (type) {
    case MarketType.bid:
      return bidStages;
    case MarketType.sellFix:
      return sellFixStages;
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

// TODO: change collection/token id's to numbers everywhere (or support both)
const useMarketplaceStages = <T>(type: MarketType, collectionId: string, tokenId: string, stages: InternalStage<T>[]): useMarketplaceStagesReturn<T> => {
  const { api } = useApi();
  const { selectedAccount } = useContext(AccountContext);

  const [internalStages, setInternalStages] = useState<InternalStage<T>[]>(stages);
  const [marketStagesStatus, setMarketStagesStatus] = useState<StageStatus>(StageStatus.default);
  const [executionError, setExecutionError] = useState<Error | undefined | null>(null);

  useEffect(() => {
    return () => {
      internalStages?.forEach((internalStage) => internalStage?.signer?.onError(new Error('Componen\'t unmounted')));
    };
  }, [internalStages]);

  const updateStage = useCallback((index: number, newStage: InternalStage<T>) => {
    const copy = [...internalStages];
    copy[index] = newStage;
    setInternalStages(copy);
  }, [internalStages, setInternalStages]);

  const getSignFunction = useCallback((index: number, internalStage: InternalStage<T>) => {
    const sign = (tx: TTransaction): Promise<TTransaction> => {
      // eslint-disable-next-line
      return new Promise(async (resolve, reject) => {
        const targetStage = { ...internalStage };
        targetStage.status = StageStatus.awaitingSign;
        targetStage.signer = {
          tx,
          status: 'awaiting',
          onSign: (signedTx: TTransaction) => resolve(signedTx),
          onError: (error: Error = new Error('Sign failed or aborted')) => reject(error)
        };
        if (!selectedAccount) throw new Error('Invalid account');
        try {
          const injector = await web3FromSource(selectedAccount.meta.source);
          const signedTx = await tx.signAsync(selectedAccount.address, { signer: injector.signer });
          resolve(signedTx);
        } catch (e) {
          reject(e);
        }
        // TODO: action of update happens inside "get" function, consider renaming or restructuring
        updateStage(index, targetStage);
      });
    };
    return sign;
  }, [updateStage, selectedAccount]);

  const executeStep = useCallback(async (stage: InternalStage<T>, index: number, txParams: T) => {
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

  const initiate = useCallback(async (params: T) => {
    setMarketStagesStatus(StageStatus.inProgress);
    for (const [index, internalStage] of internalStages.entries()) {
      try {
        await executeStep(internalStage, index, params);
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
    stages: internalStages.map((internalStage: InternalStage<T>) => {
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

export const useSellFixStages = (collectionId: string, tokenId: string) => {
  const { api } = useApi();
  const { stages, error, status, initiate } = useMarketplaceStages<TFixPriceProps>(MarketType.sellFix, collectionId, tokenId, getInternalStages<TFixPriceProps>(MarketType.sellFix, api?.market));

  return {
    stages,
    error,
    status,
    initiate
  };
};

export const usePurchaseFixStages = (collectionId: string, tokenId: string) => {
  const { api } = useApi();
  const { stages, error, status, initiate } = useMarketplaceStages<null>(MarketType.purchase, collectionId, tokenId, getInternalStages<null>(MarketType.purchase, api?.market));

  return {
    stages,
    error,
    status,
    initiate
  };
};

export const useAuctionSellStages = (collectionId: string, tokenId: string) => {
  const { api } = useApi();
  const { stages, error, status, initiate } = useMarketplaceStages<TAuctionProps>(MarketType.sellAuction, collectionId, tokenId, getInternalStages<TAuctionProps>(MarketType.sellAuction, api?.market));

  return {
    stages,
    error,
    status,
    initiate
  };
};

export const useAuctionBidStages = (collectionId: string, tokenId: string) => {
  const { api } = useApi();
  // TODO: proper params
  const { stages, error, status, initiate } = useMarketplaceStages<null>(MarketType.bid, collectionId, tokenId, getInternalStages<null>(MarketType.bid, api?.market));

  return {
    stages,
    error,
    status,
    initiate
  };
};

export const useTransferStages = (collectionId: string, tokenId: string) => {
  const { api } = useApi();
  const { stages, error, status, initiate } = useMarketplaceStages<TTransfer>(MarketType.transfer, collectionId, tokenId, getInternalStages<TTransfer>(MarketType.transfer, api?.market));

  return {
    stages,
    error,
    status,
    initiate
  };
};

export const useDelistStages = (collectionId: string, tokenId: string) => {
  const { api } = useApi();
  const { stages, error, status, initiate } = useMarketplaceStages<null>(MarketType.delist, collectionId, tokenId, getInternalStages<null>(MarketType.delist, api?.market));

  return {
    stages,
    error,
    status,
    initiate
  };
};

export default useMarketplaceStages;
