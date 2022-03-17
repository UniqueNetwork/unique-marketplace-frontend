import { useMemo } from 'react';
import { useApi } from '../useApi';
import useMarketplaceStages, { MarketplaceStage } from '../useMarketplaceStages';
import { TAuctionProps } from '../../pages/Token/Modals/types';
import { startAuction } from '../../api/restApi/auction/auction';
import { TTransaction } from '../../api/chainApi/types';
import { StageStatus } from '../../types/StagesTypes';

export const useAuctionSellStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const marketApi = api?.market;

  const sellAuctionStages: MarketplaceStage<TAuctionProps>[] = useMemo(() => [
    {
      title: 'Starting auction',
      description: '',
      status: StageStatus.default,
      action: (params) =>
        marketApi?.transferToAuction(
          params.txParams.accountAddress,
          params.collectionId.toString(),
          params.tokenId.toString(),
          {
            ...params.options,
            send:
              (signedTx: TTransaction) => startAuction({ tx: signedTx, days: params.txParams.duration, startPrice: params.txParams.startingPrice.toString(), priceStep: params.txParams.minimumStep.toString() })
            }
          )
    }
  ], [marketApi]);

  const { stages, error, status, initiate } = useMarketplaceStages<TAuctionProps>(collectionId, tokenId, sellAuctionStages);

  return {
    stages,
    error,
    status,
    initiate
  };
};
