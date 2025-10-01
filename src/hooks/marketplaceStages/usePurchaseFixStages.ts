import { useMemo } from 'react';
import { useApi } from '../useApi';
import { TPurchaseProps } from '../../pages/Token/Modals/types';
import { InternalStage, StageStatus, TInternalStageActionParams } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useAccounts } from '../useAccounts';

export const usePurchaseFixStages = (
  collectionId: number,
  tokenId: number,
  currency: number,
  contractAddress?: string
) => {
  const { api, currencyMap } = useApi();
  const { selectedAccount } = useAccounts();
  const marketApi = api?.market;
  // move money to mirror for payment on substrate wallet
  const purchaseStages: InternalStage<TPurchaseProps>[] = useMemo(() => {
    const account = selectedAccount;
    if (!account) return [];

    const stages: InternalStage<TPurchaseProps>[] = [];

    if (currency !== 0) {
      stages.push({
        title: 'Approve allowance for spending ERC20 tokens',
        status: StageStatus.default,
        action: ({ txParams }: TInternalStageActionParams<TPurchaseProps>) => {
          const currencyInfo = currencyMap?.get(currency.toString());
          const decimals = currencyInfo?.decimals || 0;
          const amount = txParams.price / Math.pow(10, decimals);
          
          return marketApi?.allowanceFungible({
            collectionId: currency,
            address: account.address,
            recipient: contractAddress || '',
            amount: amount,
            account: account,
          });
        },
      });
    }

    stages.push({
      title: 'Purchasing token',
      description: '',
      status: StageStatus.default,
      action: ({ options, txParams }: TInternalStageActionParams<TPurchaseProps>) =>
        marketApi?.buyFix(collectionId, tokenId, txParams.amount, { ...options, contractAddress }),
    });

    return stages;
  }, [marketApi, collectionId, tokenId, currency, contractAddress, selectedAccount, currencyMap]); // ✅ Добавили currencyMap

  const { stages, error, status, initiate } = useStages<TPurchaseProps>(purchaseStages, selectedAccount);

  return {
    stages,
    error,
    status,
    initiate,
  };
};
