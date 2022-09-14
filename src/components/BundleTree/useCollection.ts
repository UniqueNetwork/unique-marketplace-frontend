import { useEffect, useState } from 'react';
import { CollectionInfoWithSchema } from '@unique-nft/substrate-client/tokens';
import { useApi } from 'hooks/useApi';
import { useCollections } from 'hooks/useCollections';

export const useCollection = (collectionId: number | undefined) => {
  const [isCollectionLoading, setIsCollectionLoading] = useState(false);
  const [collection, setCollection] = useState<CollectionInfoWithSchema>();
  const { getCollection } = useCollections();
  const { api } = useApi();

  useEffect(() => {
    if (!collectionId) return;
    (async () => {
      setIsCollectionLoading(true);
      const collection = await getCollection(collectionId);
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
