import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccounts } from './useAccounts';
import { useApi } from './useApi';
import { formatKusamaBalance } from 'utils/textUtils';

interface UseFeeReturn {
  marketCommission: string,
  kusamaFee: string,
  fetchingKusamaFee: boolean,
  getKusamaFee: () => Promise<string | undefined>
}

export const useFee = (): UseFeeReturn => {
  const { api, settings, currentChain } = useApi();
  const { selectedAccount } = useAccounts();
  const [kusamaFee, setKusamaFee] = useState<string>('0');
  const [fetchingKusamaFee, setFetchingKusamaFee] = useState<boolean>(false);

  const getKusamaFee = useCallback(async () => {
    if (!selectedAccount || !api?.market) return;
    setFetchingKusamaFee(true);
    const fee = await api.market.getKusamaFee(selectedAccount.address);
    const feeFormatted = formatKusamaBalance(fee?.toString() || '0');
    setKusamaFee(feeFormatted);
    setFetchingKusamaFee(false);
    return feeFormatted;
  }, [api, selectedAccount]);

  useEffect(() => {
    getKusamaFee();
  }, [getKusamaFee]);

  const marketCommission = useMemo(() => currentChain && settings ? settings.blockchains[currentChain].blockchain.kusama.marketCommission : '0', [settings, currentChain]);

  return { marketCommission, kusamaFee, fetchingKusamaFee, getKusamaFee };
};
