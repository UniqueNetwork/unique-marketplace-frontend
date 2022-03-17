import { useMemo } from 'react';
import { useApi } from '../useApi';
import useMarketplaceStages, { MarketplaceStage } from '../useMarketplaceStages';
import { TPurchaseProps } from '../../pages/Token/Modals/types';
import { StageStatus } from '../../types/StagesTypes';

export const usePurchaseFixStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const marketApi = api?.market;
  const purchaseStages: MarketplaceStage<TPurchaseProps>[] = useMemo(() => [{
    title: 'Place a deposit',
    description: '',
    status: StageStatus.default,
    action: (params) => marketApi?.addDeposit(params.txParams.accountAddress, params.collectionId.toString(), params.tokenId.toString(), params.options)
  },
  {
    title: 'Buy token',
    description: '',
    status: StageStatus.default,
    action: (params) => marketApi?.buyToken(params.txParams.accountAddress, params.collectionId.toString(), params.tokenId.toString(), params.options)
  }], [marketApi]);
  const { stages, error, status, initiate } = useMarketplaceStages<TPurchaseProps>(collectionId, tokenId, purchaseStages);

  return {
    stages,
    error,
    status,
    initiate
  };
};
