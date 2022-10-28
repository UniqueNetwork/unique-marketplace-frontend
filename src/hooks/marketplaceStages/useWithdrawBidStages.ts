import { useMemo } from 'react';

import { withdrawBid } from 'api/restApi/auction/auction';
import { useAccounts } from '../useAccounts';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useApi } from '../useApi';
import { stringToHex } from '@polkadot/util';

export const useWithdrawBidStages = (collectionId: number, tokenId: number) => {
  const { selectedAccount } = useAccounts();
  const { baseURL } = useApi();
  const bidAuctionStages: InternalStage<null>[] = useMemo(() => [
    {
      title: 'Withdraw bid',
      description: '',
      status: StageStatus.default,
      action: async ({ options }) => {
        if (!options.signer) throw new Error('Account not selected');

        const timestamp = Date.now();
        const message = `collectionId=${collectionId}&tokenId=${tokenId}&timestamp=${timestamp}`;
        const { signature } = await options.signer.sign({ signerPayloadHex: stringToHex(message) });
        await withdrawBid(baseURL,
          { collectionId, tokenId, timestamp },
          { signature, signer: options.signer.getAddress() }
        );
      }
    }
  ], [baseURL, collectionId, tokenId]);
  const { stages, error, status, initiate } = useStages<null>(bidAuctionStages, selectedAccount);

  return {
    stages,
    error,
    status,
    initiate
  };
};
