import { useMemo } from 'react';

import { cancelAuction } from 'api/restApi/auction/auction';
import { useAccounts } from '../useAccounts';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';

export const useCancelAuctionStages = (collectionId: number, tokenId: number) => {
  const { selectedAccount, signMessage, signPayloadJSON } = useAccounts();
  const cancelAuctionStages: InternalStage<null>[] = useMemo(() => [
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
  ], [collectionId, tokenId, signMessage]);
  const { stages, error, status, initiate } = useStages<null>(cancelAuctionStages, signPayloadJSON);

  return {
    stages,
    error,
    status,
    initiate
  };
};
