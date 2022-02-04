import { gql, useQuery } from '@apollo/client';
import { useCallback } from 'react';
import { FetchMoreTokensOptions, Token, TokensData, TokensFilter, TokenStatus, TokensVariables, useGraphQlTokensProps } from './types';

const tokensQuery = gql`
  query getTokens($limit: Int, $offset: Int, $order_by: [view_tokens_order_by!] = {} , $where: view_tokens_bool_exp = {}) {
    view_tokens(where: $where, limit: $limit, offset: $offset, order_by: $order_by) {
      image_path
      collection_name
      token_id
      collection_id
      data
      owner
      token_prefix
    }
    view_tokens_aggregate {
      aggregate {
        count
      }
    }
  }
`;

// example of result: {where: {collection_id: {_in: [124, 125]}, owner: {_eq: "5H684Wa69GpbgwQ7w9nZyzVpDmEDCTexhRNmZ7mkqM1Rt7dH"}, _or: {token_id: {_eq: 2}}}, order_by: {token_id: asc}}
const getStatusQuery = (status: TokenStatus, currentAccount: string | null = null) => {
  switch (status) {
    // TODO: waiting BE
    case TokenStatus.fixedPrice:
      return {};
    // TODO: waiting BE
    case TokenStatus.myBets:
      return {};
    case TokenStatus.ownedByMe:
      return {
        owner: { _eq: currentAccount }
      };
    // TODO: waiting BE for status (on sale/on auction)
    case TokenStatus.myOnSell:
      return {
        owner: { _eq: currentAccount }
        // TODO: on sale
      };
    case TokenStatus.timedAuction:
      return {};
    default: throw new Error(`Incorrect/unsupported status passed: ${status}`);
  }
};

const getGqlParamsFromFilter = (filter: TokensFilter | undefined | null): Record<string, unknown> => {
  if (!filter) return {};

  let gqlWhere = {
    // search (token number and collection data)
    _or: {
      collection_name: { _ilike: filter.search },
      token_id: { _eq: filter.search }// tokens don't have name // TODO: try to get attributes and search over them to?
    },
    // selected collections
    collection_id: { _in: filter.collections }
  };

  // selected statuses
  if (filter.status?.length) {
    let statusQuery = {};

    // TODO: pass current user account
    for (const status of filter.status) statusQuery = { ...getStatusQuery(status, null), ...statusQuery };

    gqlWhere = { ...statusQuery, ...gqlWhere };
  }

  return { where: gqlWhere };
};

const getGqlParamsFromSorting = (sorting?: {field: keyof Token, direction: 'asc'| 'desc'}) => {
  if (!sorting) return {};
  const gqlOrderBy = { [sorting.field]: sorting.direction };

  return { order_by: gqlOrderBy };
};

export const useGraphQlTokens = ({ filter, pageSize, sorting }: useGraphQlTokensProps) => {
  const { data,
    error: fetchTokensError,
    fetchMore,
    loading: isTokensFetching } = useQuery<TokensData, TokensVariables>(tokensQuery, {
      fetchPolicy: 'network-only',
      // Used for first execution
      nextFetchPolicy: 'cache-first',
      notifyOnNetworkStatusChange: true,
      variables: {
        limit: pageSize,
        offset: 0,
        ...getGqlParamsFromFilter(filter), // TODO: get current user from RPC and pass as second param
        ...getGqlParamsFromSorting(sorting)
      }
    });

  const fetchMoreTokens = useCallback(
    ({ limit = pageSize, offset }: FetchMoreTokensOptions) => {
      return fetchMore({
        variables: {
          limit,
          offset,
          ...getGqlParamsFromFilter(filter)
        }
      });
    },
    [fetchMore, pageSize, filter]
  );

  return {
    fetchMoreTokens,
    fetchTokensError,
    isTokensFetching,
    tokens: data?.view_tokens,
    tokensCount: data?.view_tokens_aggregate.aggregate.count || 0
  };
};

export { tokensQuery };
