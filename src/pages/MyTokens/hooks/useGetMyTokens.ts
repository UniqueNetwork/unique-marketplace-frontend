import { Account } from 'account/types';
import { useCallback, useState } from 'react';
import { useQueryTokens } from 'api/scanApi/useQueryTokens';
import { GQLToken } from 'api/scanApi/types';

export const useGetMyTokens = () => {
  const [tokens, setTokens] = useState<GQLToken[]>([]);
  const { fetch, isFetching } = useQueryTokens();

  const fetchMyTokens = useCallback(async (account: Account | undefined) => {
    if (!account) return [];

    const [tokens] = await fetch({
      owner: account.address
    });
    // setTokens(tokens.map(({ attributes, ...token }) => ({
    //   ...token,
    //   attributes: Object.values(attributes || {})
    // })));
    setTokens(tokens);
    return tokens;
  }, [fetch]);

  return {
    isFetching,
    tokens,
    fetchMyTokens
  };
};
