import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { web3FromSource } from '@polkadot/extension-dapp';
import { useApi } from './useApi';
import { TTransaction } from '../api/chainApi/types';
import AccountContext from '../account/AccountContext';
import { InternalStage, MarketType, StageStatus, TInternalStageActionParams, useMarketplaceStagesReturn } from '../types/MarketTypes';
import { TAuctionProps, TFixPriceProps, TTransfer } from '../pages/Token/Modals/types';

const useMarketplaceStages = <T>(type: MarketType, collectionId: number, tokenId: number, stages: InternalStage<T>[]): useMarketplaceStagesReturn<T> => {
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
    console.log(index, newStage);
    setInternalStages(copy);
  }, [internalStages, setInternalStages]);

  const getSignFunction = useCallback((index: number, internalStage: InternalStage<T>) => {
    const sign = (tx: TTransaction): Promise<TTransaction> => {
      updateStage(index, { ...internalStage, status: StageStatus.awaitingSign });
      // eslint-disable-next-line
      return new Promise<TTransaction>(async (resolve, reject) => {
        if (!selectedAccount) throw new Error('Invalid account');
        try {
          const injector = await web3FromSource(selectedAccount.meta.source);
          const signedTx = await tx.signAsync(selectedAccount.address, { signer: injector.signer });
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

  const executeStep = useCallback(async (stage: InternalStage<T>, index: number, txParams: T) => {
    console.log(index, stage);
    updateStage(index, { ...stage, status: StageStatus.inProgress });
    try {
      // if sign is required by action -> promise wouldn't be resolved until transaction is signed
      // transaction sign could be triggered in the component that uses current stage (you can track it by using stage.signer)
      await stage.action({ account: selectedAccount?.address || '', collectionId, tokenId, txParams, options: { sign: getSignFunction(index, stage) } });
      updateStage(index, { ...stage, status: StageStatus.success });

      console.log(index, stage);
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

export const useSellFixStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const marketApi = api?.market;
  const sellFixStages = useMemo(() => [{
    title: 'Add to WhiteList',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams<TFixPriceProps>) => marketApi?.addToWhiteList(params.account, params.options)
  },
  {
    title: 'Locking NFT for sale',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams<TFixPriceProps>) => marketApi?.lockNftForSale(params.account, params.collectionId.toString(), params.tokenId.toString(), params.options)
  },
  {
    title: 'Sending NFT to Smart contract',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams<TFixPriceProps>) => marketApi?.sendNftToSmartContract(params.account, params.collectionId.toString(), params.tokenId.toString(), params.options)
  },
  {
    title: 'Setting price',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams<TFixPriceProps>) => marketApi?.setForFixPriceSale(params.account, params.collectionId.toString(), params.tokenId.toString(), params?.txParams?.price || -1, params.options)
  }], [marketApi]) as InternalStage<TFixPriceProps>[]; // TODO: solve this typization riddle
  const { stages, error, status, initiate } = useMarketplaceStages<TFixPriceProps>(MarketType.sellFix, collectionId, tokenId, sellFixStages);

  return {
    stages,
    error,
    status,
    initiate
  };
};

export const useCancelSellFixStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const marketApi = api?.market;
  const delistStages = useMemo(() => [
    {
      title: 'Cancel sale of NFT',
      description: '',
      status: StageStatus.default,
      action: (params: TInternalStageActionParams<null>) => marketApi?.cancelSell(params.account, params.collectionId.toString(), params.tokenId.toString(), params.options)
    },
    {
      title: 'Unlocking NFT',
      description: '',
      status: StageStatus.default,
      action: (params: TInternalStageActionParams<null>) => marketApi?.unlockNft(params.account, params.collectionId.toString(), params.tokenId.toString(), params.options)
    }
  ], [marketApi]) as InternalStage<null>[];
  const { stages, error, status, initiate } = useMarketplaceStages<null>(MarketType.sellFix, collectionId, tokenId, delistStages);

  return {
    stages,
    error,
    status,
    initiate
  };
};

export const usePurchaseFixStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const marketApi = api?.market;
  const purchaseStages = useMemo(() => [{
    title: 'Place a deposit',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams<null>) => marketApi?.addDeposit(params.account, params.collectionId.toString(), params.tokenId.toString(), params.options)
  },
  {
    title: 'Buy token',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams<null>) => marketApi?.buyToken(params.account, params.collectionId.toString(), params.tokenId.toString(), params.options)
  }], [marketApi]) as InternalStage<null>[];
  const { stages, error, status, initiate } = useMarketplaceStages<null>(MarketType.purchase, collectionId, tokenId, purchaseStages);

  return {
    stages,
    error,
    status,
    initiate
  };
};

export const useAuctionSellStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const marketApi = api?.market;
  const sellAuctionStages = useMemo(() => [], [marketApi]) as InternalStage<TAuctionProps>[];
  const { stages, error, status, initiate } = useMarketplaceStages<TAuctionProps>(MarketType.sellAuction, collectionId, tokenId, sellAuctionStages);

  return {
    stages,
    error,
    status,
    initiate
  };
};

export const useAuctionBidStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const marketApi = api?.market;
  const bidAuctionStages = useMemo(() => [], [marketApi]) as InternalStage<null>[]; // TODO: proper param (amount)
  const { stages, error, status, initiate } = useMarketplaceStages<null>(MarketType.bid, collectionId, tokenId, bidAuctionStages);

  return {
    stages,
    error,
    status,
    initiate
  };
};

export const useTransferStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const marketApi = api?.market;
  const transferStages = useMemo(() => [{
    title: 'Transfer token',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams<TTransfer>) => marketApi?.transferToken(params.account, params.txParams?.recipient || '', params.collectionId.toString(), params.tokenId.toString(), params.options)
  }], [marketApi]) as InternalStage<TTransfer>[];
  const { stages, error, status, initiate } = useMarketplaceStages<TTransfer>(MarketType.transfer, collectionId, tokenId, transferStages);

  return {
    stages,
    error,
    status,
    initiate
  };
};

export default useMarketplaceStages;
