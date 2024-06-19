import { useEffect, useState } from 'react';
import { useApi } from 'hooks/useApi';
import { useCollections } from 'hooks/useCollections';
import { GQLCollection } from 'api/scanApi/types';

export const useCollection = (collectionId: number | undefined) => {
  const [isCollectionLoading, setIsCollectionLoading] = useState(false);
  const [collection, setCollection] = useState<GQLCollection>();
  const { getCollection } = useCollections();
  const { api } = useApi();

  useEffect(() => {
    if (!collectionId || !api) return;
    void (async () => {
      setIsCollectionLoading(true);
      const collection = await getCollection(collectionId);
      if (collection) {
        setCollection(collection);
        setIsCollectionLoading(false);
      }
    })();
  }, [collectionId, api, getCollection]);

  return {
    collection,
    isCollectionLoading
  };
};
