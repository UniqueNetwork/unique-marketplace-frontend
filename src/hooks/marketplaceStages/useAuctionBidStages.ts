import { useMemo } from 'react';
import { useApi } from '../useApi';
import useMarketplaceStages from '../useMarketplaceStages';
import { InternalStage, MarketType, StageStatus, TInternalStageActionParams } from '../../types/MarketTypes';
import { TTransaction } from '../../api/chainApi/types';
import { placeBid } from '../../api/restApi/auction/auction';

// todo: move to types
export type TAuctionBid = {
  value: string
}

export const useAuctionBidStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const marketApi = api?.market;
  const bidAuctionStages = useMemo(() => [
    {
      title: 'Registering bid',
      description: '',
      status: StageStatus.default,
      action: (params: TInternalStageActionParams<TAuctionBid>) =>
        marketApi?.transferBidBalance(
          params.account,
          params.txParams.value,
          { ...params.options, send: (signedTx: TTransaction) => placeBid({ tx: signedTx, collectionId: params.collectionId, tokenId: params.tokenId }) })
    }
  ], [marketApi]) as InternalStage<TAuctionBid>[];
  const { stages, error, status, initiate } = useMarketplaceStages<TAuctionBid>(MarketType.bid, collectionId, tokenId, bidAuctionStages);

  return {
    stages,
    error,
    status,
    initiate
  };
};
