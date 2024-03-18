import { Account } from 'account/types';
import { useCallback } from 'react';
import { useQueryTokens } from 'api/scanApi/useQueryTokens';

export const useGetTokensCollection = () => {
  const { fetch, isFetching } = useQueryTokens();

  const fetchTokens = useCallback(async (collectionId: number, account: Account | undefined) => {
    if (!account) return [];
    return await fetch({
      owner: account.address,
      collectionIds: [collectionId]
    });
  }, [fetch]);

  return {
    isFetching,
    fetchTokens
  };
};
