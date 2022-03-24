import { useMemo } from 'react';

import useMarketplaceStages, { MarketplaceStage } from '../useMarketplaceStages';
import { withdrawBid } from '../../api/restApi/auction/auction';
import { useAccounts } from '../useAccounts';
import { StageStatus } from '../../types/StagesTypes';

export const useWithdrawBidStages = (collectionId: number, tokenId: number) => {
  const { selectedAccount, signMessage } = useAccounts();
  const bidAuctionStages: MarketplaceStage<null>[] = useMemo(() => [
    {
      title: 'Withdraw bid',
      description: '',
      status: StageStatus.default,
      action: async () => {
        if (!selectedAccount) throw new Error('Account not selected');

        const timestamp = Date.now();
        const message = `timestamp=${timestamp}&collectionId=${collectionId}&tokenId=${tokenId}`;
        const signature = await signMessage(message);
        await withdrawBid(
          { collectionId, tokenId, timestamp },
          { signature, signer: selectedAccount.address }
        );
      }
    }
  ], []);
  const { stages, error, status, initiate } = useMarketplaceStages<null>(collectionId, tokenId, bidAuctionStages);

  return {
    stages,
    error,
    status,
    initiate
  };
};
