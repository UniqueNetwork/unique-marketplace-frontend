import { useCallback, useMemo } from 'react';
import { useApi } from '../useApi';
import { TTransferFunds } from '../../pages/Accounts/Modals/types';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useAccounts } from '../useAccounts';
import { SignerPayloadJSON } from '@polkadot/types/types';

export const useTransferFundsStages = (accountAddress: string) => {
  const { api } = useApi();
  const { signPayloadJSON } = useAccounts();
  const marketApi = api?.market;
  const transferStages: InternalStage<TTransferFunds>[] = useMemo(() => [{
    title: 'Transfer funds',
    description: '',
    status: StageStatus.default,
    action: (params) => marketApi?.transferBalance(params.txParams.sender, params.txParams?.recipient || '', params.txParams?.amount, params.options)
  }], [marketApi]) as InternalStage<TTransferFunds>[];

  const sign = useCallback(async (signerPayloadJSON: SignerPayloadJSON) => {
    return await signPayloadJSON(signerPayloadJSON, accountAddress);
  }, [signPayloadJSON, accountAddress]);

  const { stages, error, status, initiate } = useStages<TTransferFunds>(transferStages, sign);

  return {
    stages,
    error,
    status,
    initiate
  };
};
