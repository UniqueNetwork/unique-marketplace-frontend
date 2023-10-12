import { post } from 'api/restApi/base';
import { useApi } from 'hooks/useApi';
import { useCallback, useState } from 'react';
import config from '../../../config';
import { GqlToken, MyToken } from 'pages/MyTokens/types';

const gqlQuery = {
  operationName: 'getTokens',
  query: `query getTokens(
    $limit: Int
    $offset: Int
    $where: TokenWhereParams = {}
    $orderBy: TokenOrderByParams = {}
  ) {
    tokens(
      where: $where
      limit: $limit
      offset: $offset
      order_by: $orderBy
      distinct_on: token_id
    ) {
      data {
        attributes
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
        tokens_amount
      }
      count
      timestamp
    }
  }`
};

type FetchParams = {
  page: number,
  pageSize: number,
  searchText: string | undefined,
  sort: string
}

export const useGetTokens = ({ collectionId }: { collectionId: number }) => {
  const { currentChainId, chainProperties } = useApi();
  const [isFetching, setIsFetching] = useState(false);
  const [tokens, setTokens] = useState<MyToken[]>([]);
  const [total, setTotal] = useState<number>(0);

  const fetchTokens = useCallback(async ({ page, pageSize, searchText, sort }: FetchParams) => {
    setIsFetching(true);

    const { scanApi } = config.blockchains[currentChainId || ''] || {};
    const response = await post(scanApi, {
      ...gqlQuery,
      variables: {
        where: {
          collection_id: { _eq: collectionId },
          ...(searchText && !Number.isNaN(Number(searchText))
          ? {
            token_id: { _eq: Number(searchText) }
          }
          : {})
        },
        limit: pageSize,
        offset: (page - 1) * pageSize,
        orderBy: sort === 'asc(TokenId)' ? { token_id: 'asc' } : { token_id: 'desc' }
      }
    });
    if (response.status === 200) {
      const tokens = response?.data?.data?.tokens?.data as GqlToken[] | [];
      if (page === 1) {
        setTokens(tokens.map(({ attributes, ...token }) => ({
          ...token,
          attributes: Object.values(attributes || {})
        })));
      } else {
        setTokens((_tokens) => ([
          ..._tokens,
          ...tokens.map<MyToken>(({ attributes, ...token }) => ({
            ...token,
            attributes: Object.values(attributes || {})
          }))
        ]));
      }
      setIsFetching(false);
      setTotal(response?.data?.data?.tokens?.count || 0);
      return tokens || [];
    }
    setIsFetching(false);
    return [];
  }, [chainProperties, collectionId]);

  return {
    isFetching,
    tokens,
    total,
    fetchTokens
  };
};
