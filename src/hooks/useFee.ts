import { useCallback, useMemo, useState } from 'react';
import { useAccounts } from './useAccounts';
import { useApi } from './useApi';
import { BN } from '@polkadot/util';

interface UseFeeReturn {
  marketCommission: string,
  kusamaFee: string,
  fetchingKusamaFee: boolean,
  getFee: (recipient: string, value: BN) => Promise<string | undefined>
}

export const useFee = (): UseFeeReturn => {
  const { api, settings } = useApi();
  const { selectedAccount } = useAccounts();
  const [kusamaFee, setKusamaFee] = useState<string>('0');
  const [fetchingKusamaFee, setFetchingKusamaFee] = useState<boolean>(false);

  const getFee = useCallback(async (recipient: string, value: BN) => {
    if (!selectedAccount || !api?.market) return;
    setFetchingKusamaFee(true);
    const fee = await api.market.getFee(selectedAccount.address, recipient, value);
    setKusamaFee(fee || '0');
    setFetchingKusamaFee(false);
    return fee || '0';
  }, [api, selectedAccount]);

  const marketCommission = useMemo(() => settings ? settings.blockchain.kusama.marketCommission : '0', [settings]);

  return { marketCommission, kusamaFee, fetchingKusamaFee, getFee };
};
