import { useMemo } from 'react';
import { useApi } from '../useApi';
import useMarketplaceStages, { MarketplaceStage } from '../useMarketplaceStages';
import { TAuctionProps } from '../../pages/Token/Modals/types';
import { startAuction } from '../../api/restApi/auction/auction';
import { TTransaction } from '../../api/chainApi/types';
import { StageStatus } from '../../types/StagesTypes';
import { fromStringToBnString } from '../../utils/bigNum';

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
              (signedTx: TTransaction) => {
                const startPrice = fromStringToBnString(params.txParams.startingPrice.toString(), api?.market?.kusamaDecimals);
                const priceStep = fromStringToBnString(params.txParams.minimumStep.toString(), api?.market?.kusamaDecimals);
                return startAuction({ tx: signedTx, days: params.txParams.duration, startPrice, priceStep });
              }
            }
          )
    }
  ], [marketApi, api?.market?.kusamaDecimals]);

  const { stages, error, status, initiate } = useMarketplaceStages<TAuctionProps>(collectionId, tokenId, sellAuctionStages);

  return {
    stages,
    error,
    status,
    initiate
  };
};
