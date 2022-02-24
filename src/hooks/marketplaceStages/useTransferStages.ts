import { useMemo } from 'react';
import { useApi } from '../useApi';
import useMarketplaceStages from '../useMarketplaceStages';
import { InternalStage, MarketType, StageStatus, TInternalStageActionParams } from '../../types/MarketTypes';
import { TTransfer } from '../../pages/Token/Modals/types';

export const useTransferStages = (collectionId: string, tokenId: string) => {
  const { api } = useApi();
  const marketApi = api?.market;
  const transferStages = useMemo(() => [{
    title: 'Transfer token',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams<TTransfer>) => marketApi?.transferToken(params.account, params.txParams?.recipient || '', params.collectionId, params.tokenId.toString(), params.options)
  }], [marketApi]) as InternalStage<TTransfer>[];
  const { stages, error, status, initiate } = useMarketplaceStages<TTransfer>(MarketType.transfer, collectionId, tokenId, transferStages);

  return {
    stages,
    error,
    status,
    initiate
  };
};