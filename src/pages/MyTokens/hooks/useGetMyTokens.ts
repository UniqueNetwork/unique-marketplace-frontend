import { MarketAccount } from 'account/types';
import { post } from 'api/restApi/base';
import { useApi } from 'hooks/useApi';
import { useCallback, useState } from 'react';
import { GqlToken, MyToken } from '../types';

const getTokensEndpoint = 'https://api-opal.uniquescan.io/v1/graphql';

const gqlQuery = {
  operationName: 'tokens_by_account_query',
  query: `query tokens_by_account_query($owner: String) {
    tokens(
      where: {tokens_owner: {_eq: $owner}, type: {_eq: NFT}, burned: {_eq: "false"}}
      limit: 1000
    ) {
      count
      data {
        tokenId: token_id
        token_name
        tokenPrefix: token_prefix
        collectionName: collection_name
        collectionDescription: collection_name
        collectionCover: collection_cover
        collectionOwner: collection_owner
        collectionId: collection_id
        creationDate: date_of_creation
        image
        type
        parent_id
        nested
        owner: tokens_owner
        childrenCount: children_count
        __typename
      }
      __typename
    }
  }`
};

export const useGetMyTokens = () => {
  const { settings } = useApi();
  const [isFetching, setIsFetching] = useState(false);
  const [tokens, setTokens] = useState<MyToken[]>([]);

  const fetchMyTokens = useCallback(async (account: MarketAccount | undefined) => {
    if (!account) return [];
    setIsFetching(true);
    const address = account.address;

    const response = await post(getTokensEndpoint, {
      ...gqlQuery,
      variables: {
        owner: address
      }
    });
    if (response.status === 200) {
      const tokens = response?.data?.data?.tokens?.data as GqlToken[] | [];
      setTokens(tokens.map(({ attributes, ...token }) => ({
        ...token,
        attributes: Object.values(attributes || {})
      })));
      setIsFetching(false);
      return tokens || [];
    }
    setIsFetching(false);
    return [];
  }, [settings]);

  return {
    isFetching,
    tokens,
    fetchMyTokens
  };
};
