import { MarketAccount } from 'account/types';
import { post } from 'api/restApi/base';
import { useApi } from 'hooks/useApi';
import { useCallback, useState } from 'react';
import { NestedTokenItem } from '../types';

const getTokensEndpoint = 'https://api-opal.uniquescan.io/v1/graphql';

const gqlQuery = {
  operationName: 'getBundleTree',
  query: `fragment tokenFields on NestingToken {
    burned
    childrenCount: children_count
    collectionId: collection_id
    image
    owner
    parentId: parent_id
    tokenId: token_id
    tokenName: token_name
    tokenPrefix: token_prefix
  }
  query getBundleTree($tokenId: Int!, $collectionId: Int!) {
    bundleTree(input: { collection_id: $collectionId, token_id: $tokenId }) {
      ...tokenFields
      nestingChildren {
        ...tokenFields
        nestingChildren {
          ...tokenFields
          nestingChildren {
            ...tokenFields
            nestingChildren {
              ...tokenFields
              nestingChildren {
                ...tokenFields
              }
            }
          }
        }
      }
    }
  }`
};

export const useGetBundleTree = () => {
  const { settings } = useApi();
  const [isFetching, setIsFetching] = useState(false);

  const fetchBundle = useCallback(async ({ collectionId, tokenId }: { collectionId: number, tokenId: number }) => {
    setIsFetching(true);

    const response = await post(getTokensEndpoint, {
      ...gqlQuery,
      variables: {
        collectionId, tokenId
      }
    });
    if (response.status === 200) {
      const tokens = response?.data?.data.bundleTree.nestingChildren as NestedTokenItem[] | [];
      setIsFetching(false);
      return tokens || [];
    }
    setIsFetching(false);
    return [];
  }, [settings]);

  return {
    isFetching,
    fetchBundle
  };
};
