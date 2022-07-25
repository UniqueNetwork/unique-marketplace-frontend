import { useEffect, useState } from 'react';
import { NFTCollection } from 'api/uniqueSdk/types';
import { useApi } from './useApi';

export const useCollections = () => {
  const { api } = useApi();
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  useEffect(() => {
    setIsFetching(true);
    if (!api) return;
    (async () => {
      const collections = await api?.collection?.getFeaturedCollections() as NFTCollection[];
      setCollections(collections);
      setIsFetching(false);
    })();
  }, [api?.collection?.getFeaturedCollections]);

  return {
    collections,
    isFetching
  };
};
