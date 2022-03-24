import { useCallback } from 'react';
import { useAccounts } from './useAccounts';
import useStages from './useStages';
import { InternalStage, useStagesReturn } from '../types/StagesTypes';

type MarketplaceStagesParams = {
  collectionId: number
  tokenId: number
}

export type MarketplaceStage<T> = InternalStage<T, MarketplaceStagesParams>;

const useMarketplaceStages = <T>(collectionId: number, tokenId: number, stages: MarketplaceStage<T>[]): useStagesReturn<T> => {
  const { signTx } = useAccounts();

  const action = useCallback(async (stageAction, txParams, options) => {
    await stageAction({ collectionId, tokenId, txParams, options });
  }, [collectionId, tokenId]);

  return useStages<T, MarketplaceStagesParams>(stages, action, signTx);
};

export default useMarketplaceStages;
