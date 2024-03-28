import { useApi } from 'hooks/useApi';
import { useCallback } from 'react';
import { useAccounts } from 'hooks/useAccounts';
import { TokenItem } from 'pages/Token/types';
import { useQueryTokens } from 'api/scanApi/useQueryTokens';

export const useGetBaseTokens = () => {
  const { currentChainId } = useApi();
  const { selectedAccount } = useAccounts();
  const { fetch, isFetching, fetchFile } = useQueryTokens();

  const fetchBaseTokens = useCallback(async (collectionIds: number[]): Promise<TokenItem[]> => {
    if (!selectedAccount) return [];
    const [tokens] = await fetch({
      collectionIds: collectionIds,
      owner: selectedAccount.address,
      type: 'NFT'
    });

    return await Promise.all(tokens.map(fetchFile));
  }, [currentChainId]);

  return {
    isFetching,
    fetchBaseTokens
  };
};
