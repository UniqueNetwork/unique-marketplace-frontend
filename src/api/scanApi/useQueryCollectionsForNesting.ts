import { Account } from 'account/types';
import { post } from 'api/restApi/base';
import { useApi } from 'hooks/useApi';
import { useCallback, useState } from 'react';
import { Address } from '@unique-nft/utils';
import { GQLCollection } from './types';
import config from 'config';

const gqlQuery = {
  operationName: 'collections_by_account_nesting_query',
  query: `query collections_by_account_nesting_query(
    $owner: String
  ) {
    tokens(
      limit: 1000
      offset: 0
      where: {tokens_owner: {_eq: $owner}, burned: {_eq: "false"}}
      distinct_on: collection_id
    ) {
      count
      data {        
        collectionName: collection_name
        collectionCover: collection_cover
        collectionOwner: collection_owner
        collectionId: collection_id
        collection {
          nestingEnabled: nesting_enabled
        }
      }
    }
  }`
};

export const useQueryCollectionsForNesting = () => {
  const { settings, currentChainId, chainProperties } = useApi();
  const [isFetching, setIsFetching] = useState(false);
  const [collections, setCollections] = useState<GQLCollection[]>([]);

  const fetchCollections = useCallback(async (account: Account | undefined) => {
    if (!account) return [];
    setIsFetching(true);
    const address = account.address;

    const { scanApi } = config.blockchains[currentChainId || ''] || {};
    const response = await post(scanApi, {
      ...gqlQuery,
      variables: {
        owner: Address.is.substrateAddressInAnyForm(address)
          ? Address.normalize.substrateAddress(address, chainProperties?.SS58Prefix)
          : address
      }
    });
    if (response.status === 200) {
      const collections = response?.data?.data?.tokens?.data as (GQLCollection & { collection: { nestingEnabled: boolean } })[] | [];
      setCollections(collections.filter((collection) => collection.collection?.nestingEnabled));
      setIsFetching(false);
      return collections;
    }
    setIsFetching(false);
    return [];
  }, [settings, chainProperties?.SS58Prefix]);

  return {
    isFetching,
    collections,
    fetchCollections
  };
};
