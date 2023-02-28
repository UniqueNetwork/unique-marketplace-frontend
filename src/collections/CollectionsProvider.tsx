import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { CollectionsProvider } from './CollectionsContext';
import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';

const CollectionsWrapper: FC = ({ children }) => {
  const [collections, setCollections] = useState<CollectionInfoWithSchemaResponse[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);

  const { api, currentChainId } = useApi();

  const fetchCollections = useCallback(async () => {
    if (!api) return;
    setIsFetching(true);
    const collections = await api?.collection?.getFeaturedCollections();
    setCollections(collections || []);
    setIsFetching(false);
  }, [api?.collection?.getFeaturedCollections]);

  useEffect(() => {
    void fetchCollections();
  }, [currentChainId, fetchCollections]);

  const value = useMemo(() => ({
    isFetching,
    collections,
    fetchCollections
  }), [isFetching, collections, fetchCollections]);

  return (
    <CollectionsProvider value={value}>
      {children}
    </CollectionsProvider>
  );
};

export default CollectionsWrapper;
