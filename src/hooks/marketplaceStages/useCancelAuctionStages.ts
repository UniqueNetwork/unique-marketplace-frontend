import { useMemo } from 'react';

import useMarketplaceStages from '../useMarketplaceStages';
import { InternalStage, MarketType, StageStatus } from '../../types/MarketTypes';
import { cancelAuction } from '../../api/restApi/auction/auction';
import { useAccounts } from '../useAccounts';

export const useCancelAuctionStages = (collectionId: number, tokenId: number) => {
  const { selectedAccount, signMessage } = useAccounts();
  const bidAuctionStages = useMemo(() => [
    {
      title: 'Cancelling auction',
      description: '',
      status: StageStatus.default,
      action: async () => {
        if (!selectedAccount) throw new Error('Account not selected');

        const timestamp = Date.now();
        const message = `timestamp=${timestamp}&collectionId=${collectionId}&tokenId=${tokenId}`;
        const signature = await signMessage(message);
        await cancelAuction(
          { collectionId, tokenId, timestamp },
          { signature, signer: selectedAccount.address }
        );
      }
    }
  ], []) as InternalStage<null>[];
  const { stages, error, status, initiate } = useMarketplaceStages<null>(MarketType.bid, collectionId, tokenId, bidAuctionStages);

  return {
    stages,
    error,
    status,
    initiate
  };
};
