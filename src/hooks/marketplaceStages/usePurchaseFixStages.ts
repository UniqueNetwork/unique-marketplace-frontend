import { useMemo } from 'react';
import { MetamaskAccount } from '@unique-nft/accounts/metamask';
import { Address } from '@unique-nft/utils';

import { useApi } from '../useApi';
import { TPurchaseProps } from '../../pages/Token/Modals/types';
import { InternalStage, StageStatus, TInternalStageActionParams } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useAccounts } from '../useAccounts';

export const usePurchaseFixStages = (collectionId: number, tokenId: number, contractAddress?: string) => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const marketApi = api?.market;
  // move money to mirror for payment on substrate wallet
  const purchaseStages: InternalStage<TPurchaseProps>[] = useMemo(() => {
    const account = selectedAccount;
    if (!account) return [];
    return [
    {
      title: 'Purchasing token',
      description: '',
      status: StageStatus.default,
      action: ({ options, txParams }) => marketApi?.buyFix(collectionId, tokenId, txParams.amount, { ...options, contractAddress })
    }
  ];
}, [marketApi, collectionId, tokenId, contractAddress]);
  const { stages, error, status, initiate } = useStages<TPurchaseProps>(purchaseStages, selectedAccount);

  return {
    stages,
    error,
    status,
    initiate
  };
};
