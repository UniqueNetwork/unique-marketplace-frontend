// TODO: this provider is OBSOLETE, consider removing it entirely
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { CollectionsProvider } from './CollectionsContext';
import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';
import config from 'config';
import { post } from 'api/restApi/base';

const CollectionsWrapper: FC = ({ children }) => {
  const [collections, setCollections] = useState<CollectionInfoWithSchemaResponse[]>([]);
  const [curatedCollections, setCuratedCollections] = useState<CollectionInfoWithSchemaResponse[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);

  const { currentChainId, featuredCollections } = useApi();

  const fetchCollections = useCallback(async () => {
    setIsFetching(true);
    const featuredCollectionsAsArray = Object.keys(featuredCollections).map((key) => featuredCollections[key].description);

    if (featuredCollectionsAsArray.length === 0) {
      return;
    }

    setCuratedCollections(Object.values(featuredCollections)
      .filter(({ isCurated }) => isCurated)
      .map(({ description }) => description));

    const gqlQuery = {
      operationName: 'collections_query',
      query: `query collections_query($ids: [Float!]) {
        collections(
          where: { collection_id: { _in: $ids } }
          distinct_on: collection_id
          limit: 10000
        ) {
          count
          data {
            attributesSchema: attributes_schema
            owner: owner_normalized
            cover: collection_cover
            id: collection_id
            name: name
            tokenPrefix: token_prefix
            properties
            permissions
            __typename
          }
          __typename
        }
      }`,
      variables: {
        ids: featuredCollectionsAsArray.map(({ id }) => id)
      }
    };
    const { scanApi } = config.blockchains[currentChainId || ''] || {};
    const { data } = await post(scanApi, gqlQuery);

    setCollections(data.data.collections.data || []);
    setIsFetching(false);
  }, [featuredCollections]);

  useEffect(() => {
    void fetchCollections();
  }, [currentChainId, fetchCollections]);

  const value = useMemo(() => ({
    isFetching,
    collections,
    curatedCollections,
    fetchCollections
  }), [isFetching, collections, fetchCollections]);

  return (
    <CollectionsProvider value={value}>
      {children}
    </CollectionsProvider>
  );
};

export default CollectionsWrapper;
