import { useApi } from '../useApi';
import { useCallback, useMemo } from 'react';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import { TTransaction } from '../../api/chainApi/types';
import { useAccounts } from '../useAccounts';
import useStages from '../useStages';

export type TWithdrawDeposit = {
  address: string
};

export const useWithdrawDepositStages = (accountAddress: string) => {
  const { api } = useApi();
  const { signTx } = useAccounts();
  const marketApi = api?.market;
  const withdrawDepositStages: InternalStage<TWithdrawDeposit>[] = useMemo(() => [{
    title: 'Withdraw deposit',
    description: '',
    status: StageStatus.default,
    action: (params) => marketApi?.withdrawDeposit(params.txParams.address, params.options)
  }], [marketApi]);

  const sign = useCallback(async (tx: TTransaction) => {
    return await signTx(tx, accountAddress);
  }, [signTx, accountAddress]);

  const { stages, error, status, initiate: initiateStages } = useStages<TWithdrawDeposit>(withdrawDepositStages, sign);

  const initiate = useCallback(() => {
    initiateStages({ address: accountAddress });
  }, [initiateStages, accountAddress]);

  return {
    stages,
    error,
    status,
    initiate
  };
};
