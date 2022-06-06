import { useEffect, useState } from 'react';
import { useApi } from './useApi';
import { NFTCollection } from '../api/chainApi/unique/types';

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
