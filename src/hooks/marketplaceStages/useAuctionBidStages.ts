import { useMemo } from 'react';
import { useApi } from '../useApi';
import { placeBidRequest } from '../../api/restApi/auction/auction';
import { TAuctionBidProps } from '../../pages/Token/Modals/types';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useAccounts } from '../useAccounts';

export const useAuctionBidStages = (collectionId: number, tokenId: number) => {
  const { api, baseURL } = useApi();
  const { selectedAccount } = useAccounts();
  const marketApi = api?.market;
  const bidAuctionStages: InternalStage<TAuctionBidProps>[] = useMemo(() => [
    {
      title: 'Registering bid',
      description: '',
      status: StageStatus.default,
      action: ({ txParams, options }) =>
        marketApi?.transferBidBalance(
          txParams.accountAddress,
          txParams.value,
          { ...options,
            send: ({ signature, signerPayloadJSON }) => placeBidRequest(baseURL, {
              signerPayloadJSON, signature, collectionId, tokenId
            }) }
        )
    }
  ], [baseURL, marketApi, collectionId, tokenId, selectedAccount]);

  const { stages, error, status, initiate } = useStages<TAuctionBidProps>(bidAuctionStages, selectedAccount);

  return {
    stages,
    error,
    status,
    initiate
  };
};
