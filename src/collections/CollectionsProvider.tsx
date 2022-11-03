import React, { FC, useMemo } from 'react';
import { CollectionsProvider } from './CollectionsContext';
import { useGraphQlCollections } from 'api/graphQL/collections/collections';
import { useApi } from 'hooks/useApi';

const MAX_INT32 = 2147483647;

const CollectionsWrapper: FC = ({ children }) => {
  const { settings } = useApi();

  const { collections, isCollectionsFetching: isFetching } = useGraphQlCollections({
    offset: 0,
    pageSize: MAX_INT32,
    filter: {
      collection_id: { _in: settings?.blockchain.unique.collectionIds }
    }
  });

  const value = useMemo(() => ({
    isFetching,
    collections
  }), [isFetching, collections]);

  return (
    <CollectionsProvider value={value}>
      {children}
    </CollectionsProvider>
  );
};

export default CollectionsWrapper;
