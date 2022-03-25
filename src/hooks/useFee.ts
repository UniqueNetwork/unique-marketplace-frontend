import { useApi } from './useApi';

export const useFee = (): {fee: string} => {
  const { settings } = useApi();

  const fee = settings?.blockchain.kusama.marketCommission || '0';

  return { fee };
};
