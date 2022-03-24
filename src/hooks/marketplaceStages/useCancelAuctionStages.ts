import { useMemo } from 'react';

import useMarketplaceStages, { MarketplaceStage } from '../useMarketplaceStages';
import { cancelAuction } from '../../api/restApi/auction/auction';
import { useAccounts } from '../useAccounts';
import { StageStatus } from '../../types/StagesTypes';

export const useCancelAuctionStages = (collectionId: number, tokenId: number) => {
  const { selectedAccount, signMessage } = useAccounts();
  const cancelAuctionStages: MarketplaceStage<null>[] = useMemo(() => [
    {
      title: 'Cancelling auction',
      description: '',
      status: StageStatus.default,
      action: async () => {
        if (!selectedAccount) throw new Error('Account not selected');

        const timestamp = Date.now();
        const message = `collectionId=${collectionId}&tokenId=${tokenId}&timestamp=${timestamp}`;
        const signature = await signMessage(message);
        await cancelAuction(
          { collectionId, tokenId, timestamp },
          { signature, signer: selectedAccount.address }
        );
      }
    }
  ], []);
  const { stages, error, status, initiate } = useMarketplaceStages<null>(collectionId, tokenId, cancelAuctionStages);

  return {
    stages,
    error,
    status,
    initiate
  };
};
