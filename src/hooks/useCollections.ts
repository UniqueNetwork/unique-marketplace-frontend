import { useEffect, useState } from 'react';
import { useApi } from './useApi';
import { CollectionInfoWithSchema } from '@unique-nft/substrate-client/tokens';

export const useCollections = () => {
  const { api } = useApi();
  const [collections, setCollections] = useState<CollectionInfoWithSchema[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  useEffect(() => {
    setIsFetching(true);
    if (!api) return;
    (async () => {
      const collections = await api?.collection?.getFeaturedCollections() as CollectionInfoWithSchema[];
      setCollections(collections);
      setIsFetching(false);
    })();
  }, [api?.collection?.getFeaturedCollections]);

  return {
    collections,
    isFetching
  };
};
