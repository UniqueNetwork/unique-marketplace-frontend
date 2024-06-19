import { useCallback, useState } from 'react';
import { useQueryTokens } from 'api/scanApi/useQueryTokens';
import { GQLToken } from 'api/scanApi/types';

type FetchParams = {
  page: number,
  pageSize: number,
  searchText: string | undefined,
  sort: string
}

export const useGetTokens = ({ collectionId }: { collectionId: number }) => {
  const [tokens, setTokens] = useState<GQLToken[]>([]);
  const [total, setTotal] = useState<number>(0);

  const { fetch, isFetching } = useQueryTokens();

  const fetchTokens = useCallback(async ({ page, pageSize, searchText, sort }: FetchParams) => {
    const [tokens, total] = await fetch({
      collectionIds: [collectionId],
      searchText,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      orderBy: sort === 'asc(TokenId)' ? { token_id: 'asc' } : { token_id: 'desc' }
    });
    setTokens(tokens);
    setTotal(total);
    return tokens;
  }, [collectionId, fetch]);

  return {
    isFetching,
    tokens,
    total,
    fetchTokens
  };
};
