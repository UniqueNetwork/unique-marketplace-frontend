// TODO: this provider is OBSOLETE, consider removing it entirely
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { CollectionsProvider } from './CollectionsContext';
import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';
import config from 'config';
import { useQueryCollections } from 'api/scanApi/useQueryCollections';
import { GQLCollection } from 'api/scanApi/types';

const CollectionsWrapper: FC = ({ children }) => {
  const [collections, setCollections] = useState<GQLCollection[]>([]);
  const [curatedCollections, setCuratedCollections] = useState<CollectionInfoWithSchemaResponse[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);

  const { currentChainId, featuredCollections } = useApi();
  const { fetch } = useQueryCollections();

  const fetchCollections = useCallback(async () => {
    setIsFetching(true);
    const featuredCollectionsAsArray = Object.keys(featuredCollections).map((key) => featuredCollections[key].description);

    if (featuredCollectionsAsArray.length === 0) {
      return;
    }

    setCuratedCollections(Object.values(featuredCollections)
      .filter(({ isCurated }) => isCurated)
      .map(({ description }) => description));

    const { scanApi } = config.blockchains[currentChainId || ''] || {};

    setCollections(await fetch());
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
