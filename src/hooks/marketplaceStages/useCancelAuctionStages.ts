import { useMemo } from 'react';

import { cancelAuction } from 'api/restApi/auction/auction';
import { useAccounts } from '../useAccounts';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useApi } from '../useApi';
import { stringToHex } from '@polkadot/util';

export const useCancelAuctionStages = (collectionId: number, tokenId: number) => {
  const { selectedAccount } = useAccounts();
  const { baseURL } = useApi();
  const cancelAuctionStages: InternalStage<null>[] = useMemo(() => [
    {
      title: 'Cancelling auction',
      description: '',
      status: StageStatus.default,
      action: async ({ options }) => {
        if (!options.account) throw new Error('Account not selected');

        const timestamp = Date.now();
        const message = `collectionId=${collectionId}&tokenId=${tokenId}&timestamp=${timestamp}`;
        const { signature } = await options.account.sign({ signerPayloadHex: stringToHex(message) });
        await cancelAuction(baseURL,
          { collectionId, tokenId, timestamp },
          { signature, signer: options.account.getAddress() }
        );
      }
    }
  ], [baseURL, collectionId, tokenId]);
  const { stages, error, status, initiate } = useStages<null>(cancelAuctionStages, selectedAccount);

  return {
    stages,
    error,
    status,
    initiate
  };
};
