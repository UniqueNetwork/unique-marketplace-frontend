import { useContext, useMemo } from 'react';

import { useApi } from '../useApi';
import useMarketplaceStages from '../useMarketplaceStages';
import { InternalStage, MarketType, StageStatus } from '../../types/MarketTypes';
import AccountContext from '../../account/AccountContext';
import { cancelAuction } from '../../api/restApi/auction/auction';
import { getSignature } from './utils/getSignature';

export const useCancelAuctionStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const { selectedAccount } = useContext(AccountContext);
  const marketApi = api?.market;
  const bidAuctionStages = useMemo(() => [
    {
      title: 'Cancelling auction',
      description: '',
      status: StageStatus.default,
      action: async () => {
        if (!selectedAccount) throw new Error('Account not selected');

        const { signature, params } = await getSignature(collectionId, tokenId, selectedAccount);
        await cancelAuction(
          params,
          { 'x-polkadot-signature': signature, 'x-polkadot-signer': selectedAccount.address }
        );
      }
    }
  ], [marketApi]) as InternalStage<null>[];
  const { stages, error, status, initiate } = useMarketplaceStages<null>(MarketType.bid, collectionId, tokenId, bidAuctionStages);

  return {
    stages,
    error,
    status,
    initiate
  };
};
