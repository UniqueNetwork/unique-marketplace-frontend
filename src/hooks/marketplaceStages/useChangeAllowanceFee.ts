import { useAccounts } from 'hooks/useAccounts';
import { useApi } from 'hooks/useApi';
import { useState, useCallback } from 'react';

interface Options {
  [key: string]: any;
}

const useEstimateGasChangeAllowance = () => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const marketApi = api?.market;
  const [fee, setFee] = useState<string | null>(null);
  const [fetchingFee, setFetchingFee] = useState<boolean>(false);

  const getFee = useCallback(
    async (collectionId: number, tokenId: number) => {
      if (!selectedAccount) throw Error('No account selected')
      setFetchingFee(true);

      try {
        const estimatedFee = await marketApi?.estimateGasChangeAllowance(
          collectionId,
          tokenId,
          { account: selectedAccount }
        );

        estimatedFee && setFee(estimatedFee);
      } catch (error) {
        console.error('Failed to estimate gas:', error);
        setFee(null);
      } finally {
        setFetchingFee(false);
      }
    },
    [selectedAccount]
  );

  return { fee, fetchingFee, getFee };
};

declare function estimateGasChangeAllowance(
  collectionId: number,
  tokenId: number,
  isApproved: boolean,
  options: Options
): Promise<string>;

export default useEstimateGasChangeAllowance;
