import config from 'config';
import { useApi } from 'hooks/useApi';
import { useCallback } from 'react';
import { post } from 'api/restApi/base';
import { GQLCollection } from './types';
import { Address } from '@unique-nft/utils';

const gqlQuery = {
  operationName: 'collections_query',
  query: `query collections_query(
      $where: CollectionWhereParams
      $offset: Int
      $limit: Int
    ) {
    collections(
      where: $where
      distinct_on: collection_id
      limit: $limit
      offset: $offset
    ) {
      count
      data {
        attributesSchema: attributes_schema
        description
        owner: owner_normalized
        cover: collection_cover
        id: collection_id
        creationDate: date_of_creation
        name: name
        tokenPrefix: token_prefix
        tokensCount: tokens_count
        tokenLimit: token_limit
        properties
        permissions
        mode
        __typename
      }
      __typename
    }
  }`
};

type FetchCollectionParams = {
  owner?: string;
  ids?: number[];
  limit?: number;
  offset?: number;
  searchText?: string;
}

const DEFAULT_LIMIT = 1000;

export const useQueryCollections = () => {
  const { currentChainId } = useApi();

  const fetch = useCallback(
    async ({ ids, owner, limit, offset, searchText }: FetchCollectionParams = {}): Promise<{
      collections: GQLCollection[];
      count: number;
    }> => {
      if (!currentChainId) return { collections: [], count: 0 };
      const { scanApi } = config.blockchains[currentChainId || ''] || {};

      const variables = {
        where: {
          ...(ids ? { collection_id: { _in: ids } } : {}),
          ...(owner
            ? {
                _or: [
                  { owner: { _eq: owner } },
                  {
                    owner_normalized: {
                      _eq: Address.is.ethereumAddressInAnyForm(owner)
                        ? Address.mirror.ethereumToSubstrate(owner)
                        : Address.normalize.substrateAddress(owner)
                    }
                  }
                ]
              }
            : {}),
          ...(searchText
            ? {
                name: {
                  _like: `${searchText}%`
                }
              }
            : {}),
          burned: { _eq: 'false' }
        },
        limit: limit || DEFAULT_LIMIT,
        offset
      };
      const { data } = await post(scanApi, { ...gqlQuery, variables });
      return (
        {
          collections: data.data.collections.data,
          count: data.data.collections.count
        } || { collections: [], count: 0 }
      );
    },
    [currentChainId]
  );

  const fetchOne = useCallback(async (id: number): Promise<GQLCollection | undefined> => {
    if (!currentChainId) return;
    const { scanApi } = config.blockchains[currentChainId || ''] || {};

    const { data } = await post(scanApi, {
      ...gqlQuery,
      variables: {
        where: {
          collection_id: { _eq: id },
          burned: { _eq: 'false' }
        }
      }
    });

    return data.data.collections.data[0] as GQLCollection;
  }, [currentChainId]);

  return { fetch, fetchOne };
};
