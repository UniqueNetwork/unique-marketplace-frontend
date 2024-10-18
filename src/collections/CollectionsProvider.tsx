// TODO: this provider is OBSOLETE, consider removing it entirely
import React, { FC, useCallback, useEffect, useMemo, useState, ReactNode } from 'react';
import { useApi } from '../hooks/useApi';
import { CollectionsProvider } from './CollectionsContext';
import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';
import { useQueryCollections } from 'api/scanApi/useQueryCollections';
import { GQLCollection } from 'api/scanApi/types';

interface CollectionsWrapperProps {
  children: ReactNode;
}

const CollectionsWrapper: FC<CollectionsWrapperProps> = ({ children }) => {
  const [collections, setCollections] = useState<GQLCollection[]>([]);
  const [curatedCollections, setCuratedCollections] = useState<CollectionInfoWithSchemaResponse[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);

  const { currentChainId, featuredCollections } = useApi();
  const { fetch } = useQueryCollections();
  const FETCH_COLLECTIONS_LIMIT = 100;
  const [offset, setOffset] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchCollections = useCallback(async () => {
    setIsFetching(true);
    const featuredCollectionsAsArray = Object.keys(featuredCollections).map((key) => featuredCollections[key].description);

    if (featuredCollectionsAsArray.length === 0) {
      return;
    }

    setCuratedCollections(Object.values(featuredCollections)
      .filter(({ isCurated }) => isCurated)
      .map(({ description }) => description));

    const { collections: newCollections, count } = await fetch({ limit: FETCH_COLLECTIONS_LIMIT, offset });
    setTotalCount(count);
    setCollections([...collections, ...newCollections]);
    setOffset(offset + FETCH_COLLECTIONS_LIMIT);
    setIsFetching(false);
  }, [featuredCollections, offset]);

  useEffect(() => {
    void fetchCollections();
  }, [currentChainId, featuredCollections]);

  const value = useMemo(() => ({
    isFetching,
    collections,
    curatedCollections,
    offset,
    totalCount,
    fetchCollections
  }), [isFetching, collections, curatedCollections, offset, totalCount, fetchCollections]);

  return (
    <CollectionsProvider value={value}>
      {children}
    </CollectionsProvider>
  );
};

export default CollectionsWrapper;
