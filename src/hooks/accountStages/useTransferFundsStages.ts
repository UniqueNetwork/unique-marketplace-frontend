import { useMemo } from 'react';
import { useApi } from '../useApi';
import { TTransferFunds } from '../../pages/Accounts/Modals/types';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useAccounts } from '../useAccounts';

export const useTransferFundsStages = (accountAddress: string) => {
  const { api } = useApi();
  const { accounts, fetchAccounts } = useAccounts();
  const marketApi = api?.market;
  const transferStages: InternalStage<TTransferFunds>[] = useMemo(() => [{
    title: 'Transfer funds',
    description: '',
    status: StageStatus.default,
    action: async (params) => {
      const currency = params.txParams?.currency;
      if (currency) {
        if (typeof params.txParams?.amount !== 'number') return;
        await marketApi?.transferBalanceFungible({
          collectionId: currency,
          address: accountAddress,
          recipient: params.txParams?.recipient,
          amount: params.txParams?.amount,
          account: params.options?.account,
          decimals: params.txParams?.decimals
        });
      } else {
        await marketApi?.transferBalance(
          params.txParams.sender,
          params.txParams?.recipient || '',
          params.txParams?.amount,
          params.options
        );
      }
      // await updateAccountBalance(params.txParams.sender);
      // await updateAccountBalance(params.txParams?.recipient);
    }
  }], [marketApi]) as InternalStage<TTransferFunds>[];

  const signer = useMemo(() => {
    return accounts.get(accountAddress);
  }, [accounts, accountAddress]);

  const { stages, error, status, initiate } = useStages<TTransferFunds>(transferStages, signer);

  return {
    stages,
    error,
    status,
    initiate
  };
};
