import { useState } from 'react';
import { GQLCollection } from 'api/scanApi/types';
import { useQueryCollections } from 'api/scanApi/useQueryCollections';

export const useTextSearchCollections = () => {
  const [textSearchCollections, setTextSearchCollections] = useState<GQLCollection[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { fetch } = useQueryCollections();

  const fetchCollectionsTextLike = async (searchText: string) => {
    setIsFetching(true);
    setError(null);
    try {
      const { collections } = await fetch({ searchText });
      setTextSearchCollections(collections);
    } catch (error) {
      setError("An error occurred while fetching collections.");
    } finally {
      setIsFetching(false);
    }
  };

  return { textSearchCollections, isFetching, fetchCollectionsTextLike, error };
};
