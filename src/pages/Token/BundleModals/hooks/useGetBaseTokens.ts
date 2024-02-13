import { post } from 'api/restApi/base';
import { useApi } from 'hooks/useApi';
import { useCallback, useState } from 'react';
import config from '../../../../config';
import { useAccounts } from 'hooks/useAccounts';
import { TokenItem } from 'pages/Token/types';

const gqlQuery = {
  operationName: 'tokens_by_collection_query',
  query: `query tokens_by_collection_query(\
    $where: TokenWhereParams
    $offset: Int
    $limit: Int
  ) {
    tokens(
      where: $where
      limit: $limit
      offset: $offset
      order_by: { token_id: asc }
    ) {
      count
      data {
        owner
        tokenId: token_id
        tokenName: token_name
        tokenPrefix: token_prefix
        collectionId: collection_id
        collectionName: collection_name
        image
        nested
        parent: parent_id
      }
    }
  }`
};

export const useGetBaseTokens = () => {
  const { currentChainId } = useApi();
  const { selectedAccount } = useAccounts();
  const [isFetching, setIsFetching] = useState(false);
  const { api } = useApi();

  const fetchFile = useCallback(async (token: TokenItem): Promise<TokenItem> => {
    const response = await api?.nft?.getToken(token.collectionId, token.tokenId);
    return { ...token, file: response?.file };
  }, [api?.nft]);

  const fetchBaseTokens = useCallback(async (collectionIds: number[]): Promise<TokenItem[]> => {
    setIsFetching(true);

    const { scanApi } = config.blockchains[currentChainId || ''] || {};
    const response = await post(scanApi, {
      ...gqlQuery,
      variables: {
        limit: 1000,
        offset: 0,
        where: {
          collection_id: { _in: collectionIds },
          owner: { _eq: selectedAccount?.address },
          burned: { _eq: 'false' },
          type: { _eq: 'NFT' }
        }
      }
    });
    setIsFetching(false);

    if (response.status === 200) {
      return await Promise.all((response?.data?.data?.tokens?.data as TokenItem[] || []).map(fetchFile));
    }
    return [];
  }, [currentChainId]);

  return {
    isFetching,
    fetchBaseTokens
  };
};
