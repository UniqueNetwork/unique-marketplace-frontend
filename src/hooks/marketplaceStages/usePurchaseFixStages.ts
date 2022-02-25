import { useMemo } from 'react';
import { useApi } from '../useApi';
import useMarketplaceStages from '../useMarketplaceStages';
import { InternalStage, MarketType, StageStatus, TInternalStageActionParams } from '../../types/MarketTypes';

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
