import { useMemo } from 'react';
import { useApi } from '../useApi';
import useMarketplaceStages, { MarketplaceStage } from '../useMarketplaceStages';
import { TTransaction } from '../../api/chainApi/types';
import { placeBid } from '../../api/restApi/auction/auction';
import { TAuctionBidProps } from '../../pages/Token/Modals/types';
import { StageStatus } from '../../types/StagesTypes';

export const useAuctionBidStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const marketApi = api?.market;
  const bidAuctionStages: MarketplaceStage<TAuctionBidProps>[] = useMemo(() => [
    {
      title: 'Registering bid',
      description: '',
      status: StageStatus.default,
      action: (params) =>
        marketApi?.transferBidBalance(
          params.txParams.accountAddress,
          params.txParams.value,
          { ...params.options, send: (signedTx: TTransaction) => placeBid({ tx: signedTx, collectionId: params.collectionId, tokenId: params.tokenId }) })
    }
  ], [marketApi]);
  const { stages, error, status, initiate } = useMarketplaceStages<TAuctionBidProps>(collectionId, tokenId, bidAuctionStages);

  return {
    stages,
    error,
    status,
    initiate
  };
};
