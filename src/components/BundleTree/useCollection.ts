import { useEffect, useState } from 'react';
import { CollectionInfoWithSchema } from '@unique-nft/substrate-client/tokens';
import { useApi } from '../../hooks/useApi';

export const useCollection = (collectionId: number | undefined) => {
  const [isCollectionLoading, setIsCollectionLoading] = useState(false);
  const [collection, setCollection] = useState<CollectionInfoWithSchema>();
  const { api } = useApi();
  useEffect(() => {
    if (!collectionId) return;
    (async () => {
      setIsCollectionLoading(true);
      const collection = await api?.collection?.getCollection(collectionId);
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
