import config from 'config';
import { useApi } from 'hooks/useApi';
import { useCallback } from 'react';
import { post } from 'api/restApi/base';
import { GQLCollection } from './types';
import { Address } from '@unique-nft/utils';

const gqlQuery = {
  operationName: 'collections_query',
  query: `query collections_query($where: CollectionWhereParams) {
    collections(
      where: $where
      distinct_on: collection_id
      limit: 10000
    ) {
      count
      data {
        attributesSchema: attributes_schema
        description
        owner: owner_normalized
        cover: collection_cover
        id: collection_id
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
}

export const useQueryCollections = () => {
  const { currentChainId, featuredCollections } = useApi();

  const fetch = useCallback(async ({ ids, owner }: FetchCollectionParams = {}): Promise<GQLCollection[]> => {
    if (!currentChainId) return [];
    const { scanApi } = config.blockchains[currentChainId || ''] || {};

    const variables = { where: {
      ...(ids ? { collection_id: { _in: ids } } : {}),
      ...(owner
      ? { _or: [
        { owner: { _eq: owner } },
        {
          owner_normalized: {
            _eq: Address.is.ethereumAddressInAnyForm(owner)
            ? Address.mirror.ethereumToSubstrate(owner)
            : Address.normalize.substrateAddress(owner)
          }
        }
      ] }
    : {}),
      burned: { _eq: 'false' }
    } };
    const { data } = await post(scanApi, { ...gqlQuery, variables });
    return (data.data.collections.data || []) as GQLCollection[];
  }, [currentChainId]);

  const fetchFeatured = useCallback(async (): Promise<GQLCollection[]> => {
    const ids = Object.values(featuredCollections).map(({ description }) => description.id);
    return fetch({ ids });
  }, [fetch]);

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

  return { fetch, fetchOne, fetchFeatured };
};
