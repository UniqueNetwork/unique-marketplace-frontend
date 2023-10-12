import { useMemo } from 'react';
import { useApi } from '../useApi';
import { TWithdrawFunds } from '../../pages/Accounts/Modals/types';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useAccounts } from '../useAccounts';

export const useWithdrawStages = (accountAddress: string) => {
  const { api } = useApi();
  const { accounts } = useAccounts();
  const marketApi = api?.market;
  const transferStages: InternalStage<TWithdrawFunds>[] = useMemo(() => [{
    title: 'Withdrawing funds',
    description: '',
    status: StageStatus.default,
    action: (params) => marketApi?.transferBalance(
      params.txParams?.sender,
      params.txParams?.recipient || '',
      params.options.account.balances?.ethMirror.raw || '0',
      params.options
    )
  }], [marketApi, accountAddress]) as InternalStage<TWithdrawFunds>[];

  const signer = useMemo(() => {
    return accounts.get(accountAddress);
  }, [accounts, accountAddress]);

  const { stages, error, status, initiate } = useStages<TWithdrawFunds>(transferStages, signer);

  return {
    stages,
    error,
    status,
    initiate
  };
};
