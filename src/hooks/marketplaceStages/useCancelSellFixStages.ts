import { useMemo } from 'react';
import { useApi } from '../useApi';
import useMarketplaceStages, { MarketplaceStage } from '../useMarketplaceStages';
import { TDelistProps } from '../../pages/Token/Modals/types';
import { StageStatus } from '../../types/StagesTypes';

export const useCancelSellFixStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const marketApi = api?.market;
  const delistStages: MarketplaceStage<TDelistProps>[] = useMemo(() => [
    {
      title: 'Unlocking NFT',
      description: '',
      status: StageStatus.default,
      action: (params) => marketApi?.cancelSell(params.txParams.accountAddress, params.collectionId.toString(), params.tokenId.toString(), params.options)
    },
    {
      title: 'Sending NFT to wallet',
      description: '',
      status: StageStatus.default,
      action: (params) => marketApi?.unlockNft(params.txParams.accountAddress, params.collectionId.toString(), params.tokenId.toString(), params.options)
    }
  ], [marketApi]);
  const { stages, error, status, initiate } = useMarketplaceStages<TDelistProps>(collectionId, tokenId, delistStages);

  return {
    stages,
    error,
    status,
    initiate
  };
};
