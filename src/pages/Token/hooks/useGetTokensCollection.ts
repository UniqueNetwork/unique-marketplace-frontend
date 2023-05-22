import { MarketAccount } from 'account/types';
import { post } from 'api/restApi/base';
import { useApi } from 'hooks/useApi';
import { useCallback, useState } from 'react';
import { TokenItem } from '../types';

const getTokensEndpoint = 'https://api-opal.uniquescan.io/v1/graphql';

const gqlQuery = {
  operationName: 'tokens_by_collection_query',
  query: `query tokens_by_collection_query(\
    $where: TokenWhereParams
  ) {
    tokens(
      where: $where
      offset: 0
      limit: 1000
      order_by: { token_id: asc }
      distinct_on: token_id
    ) {
      count
      data {
        tokenId: token_id
        tokenName: token_name
        tokenPrefix: token_prefix
        collectionId: collection_id
        collectionName: collection_name
        image
        nested
      }
    }
  }`
};

export const useGetTokensCollection = () => {
  const { settings } = useApi();
  const [isFetching, setIsFetching] = useState(false);
  const [tokens, setTokens] = useState<TokenItem[]>([]);

  const fetchTokens = useCallback(async (collectionId: number, account: MarketAccount | undefined) => {
    if (!account) return [];
    setIsFetching(true);
    const address = account.address;

    const response = await post(getTokensEndpoint, {
      ...gqlQuery,
      variables: {
        where: {
          tokens_owner: { _eq: address },
          collection_id: { _eq: collectionId },
          burned: { _eq: 'false' }
        }
      }
    });
    if (response.status === 200) {
      const tokens = response?.data?.data?.tokens?.data as TokenItem[] | [];
      setTokens(tokens);
      setIsFetching(false);
      return tokens || [];
    }
    setIsFetching(false);
    return [];
  }, [settings]);

  return {
    isFetching,
    tokens,
    fetchTokens
  };
};
