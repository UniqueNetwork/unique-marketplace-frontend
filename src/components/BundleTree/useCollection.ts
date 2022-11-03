import { useEffect, useState } from 'react';
import { useApi } from 'hooks/useApi';
import { useCollections } from 'hooks/useCollections';
import { Collection } from 'api/graphQL/collections/types';

export const useCollection = (collectionId: number | undefined) => {
  const [isCollectionLoading, setIsCollectionLoading] = useState(false);
  const [collection, setCollection] = useState<Collection>();
  const { getCollection } = useCollections();
  const { api } = useApi();

  useEffect(() => {
    if (!collectionId) return;
    (() => {
      setIsCollectionLoading(true);
      const collection = getCollection(collectionId);
      if (collection) {
        setCollection(collection);
        setIsCollectionLoading(false);
      }
    })();
  }, [collectionId, api]);

  return {
    collection,
    isCollectionLoading
  };
};
