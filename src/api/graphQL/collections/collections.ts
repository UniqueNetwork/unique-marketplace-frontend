import { gql, useApolloClient, useQuery } from '@apollo/client';
import { useCallback } from 'react';
import { CollectionsData, CollectionsVariables, FetchMoreCollectionsOptions, useGraphQlCollectionsProps } from './types';

const collectionsQuery = gql`
  query getCollections($limit: Int, $offset: Int, $where: collections_bool_exp = {}) {
    collections(where: $where, limit: $limit, offset: $offset) {
      collection_id
      description
      name
      owner
      token_prefix
      offchain_schema
      schema_version
      tokens_aggregate {
        aggregate {
          count
        }
      }
    }
    collections_aggregate {
      aggregate {
        count
      }
    }
  }
`;

export const useGraphQlCollections = ({ filter, pageSize }: useGraphQlCollectionsProps) => {
  const client = useApolloClient();

  const getWhere = useCallback(
    (searchString?: string) => ({
      _and: {
        ...(filter ? { _or: filter } : {}),
        ...(searchString
          ? {
              _or: {
                description: { _ilike: searchString },
                name: { _ilike: searchString },
                token_prefix: { _ilike: searchString }
              }
            }
          : {})
      }
    }),
    [filter]
  );

  const { data,
    error: fetchCollectionsError,
    fetchMore,
    loading: isCollectionsFetching } = useQuery<CollectionsData, CollectionsVariables>(collectionsQuery, {
    fetchPolicy: 'network-only',
    // Used for first execution
nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
    variables: {
      limit: pageSize,
      offset: 0,
      where: getWhere()
    }
  });

  const fetchMoreCollections = useCallback(
    ({ limit = pageSize, offset, searchString }: FetchMoreCollectionsOptions) => {
      return fetchMore({
        variables: {
          limit,
          offset,
          where: getWhere(searchString)
        }
      });
    },
    [fetchMore, filter, pageSize]
  );

  return {
    collections: data?.collections || [],
    collectionsCount: data?.collections_aggregate.aggregate.count || 0,
    fetchCollectionsError,
    fetchMoreCollections,
    isCollectionsFetching
  };
};

export { collectionsQuery };
