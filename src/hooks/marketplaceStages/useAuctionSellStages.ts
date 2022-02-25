import { useMemo } from 'react';
import { useApi } from '../useApi';
import useMarketplaceStages from '../useMarketplaceStages';
import { InternalStage, MarketType, StageStatus, TInternalStageActionParams } from '../../types/MarketTypes';
import { TAuctionProps } from '../../pages/Token/Modals/types';
import { startAuction } from '../../api/restApi/auction/auction';
import { TTransaction } from '../../api/chainApi/types';

export const useAuctionSellStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const marketApi = api?.market;
  const sellAuctionStages = useMemo(() => [
    {
      title: 'Starting auction',
      description: '',
      status: StageStatus.default,
      action: (params: TInternalStageActionParams<TAuctionProps>) =>
        marketApi?.transferToken(params.account,
          'contract_address',
          params.collectionId.toString(),
          params.tokenId.toString(),
          { ...params.options, send: (signedTx: TTransaction) => startAuction({ tx: signedTx, days: params.txParams.duration, startPrice: params.txParams.startingPrice.toString(), priceStep: params.txParams.minimumStep.toString() }) })
    }
  ], [marketApi]) as InternalStage<TAuctionProps>[];
  const { stages, error, status, initiate } = useMarketplaceStages<TAuctionProps>(MarketType.sellAuction, collectionId, tokenId, sellAuctionStages);

  return {
    stages,
    error,
    status,
    initiate
  };
};
