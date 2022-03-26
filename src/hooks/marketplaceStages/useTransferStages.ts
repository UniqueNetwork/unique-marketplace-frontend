import { useMemo } from 'react';
import { useApi } from '../useApi';
import useMarketplaceStages, { MarketplaceStage } from '../useMarketplaceStages';
import { TTransfer } from '../../pages/Token/Modals/types';
import { StageStatus } from '../../types/StagesTypes';

export const useTransferStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const marketApi = api?.market;
  const transferStages: MarketplaceStage<TTransfer>[] = useMemo(() => [{
    title: 'Transfer in progress',
    description: '',
    status: StageStatus.default,
    action: (params) => marketApi?.transferToken(params.txParams.sender, params.txParams?.recipient || '', params.collectionId.toString(), params.tokenId.toString(), params.options)
  }], [marketApi]);
  const { stages, error, status, initiate } = useMarketplaceStages<TTransfer>(collectionId, tokenId, transferStages);

  return {
    stages,
    error,
    status,
    initiate
  };
};
