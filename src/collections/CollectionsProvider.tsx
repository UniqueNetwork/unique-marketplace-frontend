// TODO: this provider is OBSOLETE, consider removing it entirely
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { CollectionsProvider } from './CollectionsContext';
import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';

const CollectionsWrapper: FC = ({ children }) => {
  const [collections, setCollections] = useState<CollectionInfoWithSchemaResponse[]>([]);
  const [curatedCollections, setCuratedCollections] = useState<CollectionInfoWithSchemaResponse[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);

  const { currentChainId, featuredCollections } = useApi();

  const fetchCollections = useCallback(() => {
    setIsFetching(true);
    const featuredCollectionsAsArray = Object.keys(featuredCollections).map((key) => featuredCollections[key].description);
    setCuratedCollections(Object.values(featuredCollections)
      .filter(({ isCurated }) => isCurated)
      .map(({ description }) => description));
    setCollections(featuredCollectionsAsArray || []);
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
