import { post } from 'api/restApi/base';
import config from 'config';
import { useApi } from 'hooks/useApi';
import { NestedTokenItem } from 'pages/Token/types';
import { useCallback, useState } from 'react';

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

export const useQueryBundleTree = () => {
  const { settings, currentChainId } = useApi();
  const [isFetching, setIsFetching] = useState(false);

  const fetchBundle = useCallback(async ({ collectionId, tokenId }: { collectionId: number, tokenId: number }) => {
    setIsFetching(true);

    const { scanApi } = config.blockchains[currentChainId || ''] || {};
    const response = await post(scanApi, {
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
