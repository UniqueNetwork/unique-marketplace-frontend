import { useCallback, useContext } from 'react';
import CollectionsContext from 'collections/CollectionsContext';
import { useApi } from './useApi';

export const useCollections = () => {
  const { isFetching, collections, fetchCollections } = useContext(CollectionsContext);
  const { api } = useApi();

  const getCollection = useCallback(async (collectionId: number) => {
    const collection = collections.find(({ id }) => collectionId === id);
    return collection || await api?.collection?.getCollection(Number(collectionId));
  }, [api?.collection, collections]);

  return {
    collections,
    isFetching,
    fetchCollections,
    getCollection
  };
};
