import { useMemo } from 'react';
import { useApi } from '../useApi';
import { TPurchaseProps } from '../../pages/Token/Modals/types';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useAccounts } from '../useAccounts';

export const usePurchaseFixStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const marketApi = api?.market;
  const purchaseStages: InternalStage<TPurchaseProps>[] = useMemo(() => [{
    title: 'Place a deposit',
    description: '',
    status: StageStatus.default,
    action: ({ txParams, options }) => marketApi?.addDeposit(
      txParams.accountAddress,
      collectionId.toString(),
      tokenId.toString(),
      options)
  },
  {
    title: 'Buy NFT',
    description: '',
    status: StageStatus.default,
    action: ({ txParams, options }) => marketApi?.buyToken(
      txParams.accountAddress,
      collectionId.toString(),
      tokenId.toString(),
      options
    )
  },
  {
    title: 'Sending NFT to wallet',
    description: '',
    status: StageStatus.default,
    action: ({ txParams, options }) => marketApi?.unlockNft(
      txParams.accountAddress,
      collectionId.toString(),
      tokenId.toString(),
      options
    )
  }], [marketApi, collectionId, tokenId]);
  const { stages, error, status, initiate } = useStages<TPurchaseProps>(purchaseStages, selectedAccount);

  return {
    stages,
    error,
    status,
    initiate
  };
};
