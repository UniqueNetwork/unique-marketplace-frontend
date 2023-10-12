import { useMemo } from 'react';
import { useApi } from '../useApi';
import { TTransferFunds } from '../../pages/Accounts/Modals/types';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useAccounts } from '../useAccounts';
import { BN } from '@polkadot/util';

export const useTransferFundsStages = (accountAddress: string) => {
  const { api } = useApi();
  const { accounts } = useAccounts();
  const marketApi = api?.market;
  const transferStages: InternalStage<TTransferFunds>[] = useMemo(() => [{
    title: 'Transfer funds',
    description: '',
    status: StageStatus.default,
    action: async (params) => {
      await marketApi?.transferBalance(params.txParams.sender, params.txParams?.recipient || '', params.txParams?.amount, params.options);
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
