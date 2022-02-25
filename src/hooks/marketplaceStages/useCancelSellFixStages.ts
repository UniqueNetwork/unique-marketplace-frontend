import { useMemo } from 'react';
import { useApi } from '../useApi';
import useMarketplaceStages from '../useMarketplaceStages';
import { InternalStage, MarketType, StageStatus, TInternalStageActionParams } from '../../types/MarketTypes';

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
