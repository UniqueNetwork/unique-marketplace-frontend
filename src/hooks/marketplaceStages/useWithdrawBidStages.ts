import { useMemo } from 'react';

import { withdrawBid } from 'api/restApi/auction/auction';
import { useAccounts } from '../useAccounts';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';

export const useWithdrawBidStages = (collectionId: number, tokenId: number) => {
  const { selectedAccount, signMessage, signPayloadJSON } = useAccounts();
  const bidAuctionStages: InternalStage<null>[] = useMemo(() => [
    {
      title: 'Withdraw bid',
      description: '',
      status: StageStatus.default,
      action: async () => {
        if (!selectedAccount) throw new Error('Account not selected');

        const timestamp = Date.now();
        const message = `collectionId=${collectionId}&tokenId=${tokenId}&timestamp=${timestamp}`;
        const signature = await signMessage(message);
        await withdrawBid(
          { collectionId, tokenId, timestamp },
          { signature, signer: selectedAccount.address }
        );
      }
    }
  ], [collectionId, tokenId]);
  const { stages, error, status, initiate } = useStages<null>(bidAuctionStages, signPayloadJSON);

  return {
    stages,
    error,
    status,
    initiate
  };
};
