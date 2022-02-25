import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { web3FromSource } from '@polkadot/extension-dapp';
import { TTransaction } from '../api/chainApi/types';
import AccountContext from '../account/AccountContext';
import { InternalStage, MarketType, StageStatus, useMarketplaceStagesReturn } from '../types/MarketTypes';

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
    setInternalStages((stages) => {
      const copy = [...stages];
      copy[index] = newStage;
      return copy;
    });
  }, [setInternalStages]);

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
    updateStage(index, { ...stage, status: StageStatus.inProgress });
    try {
      // if sign is required by action -> promise wouldn't be resolved until transaction is signed
      // transaction sign could be triggered in the component that uses current stage (you can track it by using stage.signer)
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

export default useMarketplaceStages;
