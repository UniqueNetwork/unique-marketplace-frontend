import { useCallback, useContext } from 'react';
import CollectionsContext from 'collections/CollectionsContext';
import { useApi } from './useApi';

export const useCollections = () => {
  const { isFetching, collections } = useContext(CollectionsContext);
  const { api } = useApi();

  const getCollection = useCallback((collectionId: number) => {
    const collection = collections.find(({ id }) => collectionId === id);
    return collection;// || await api?.collection?.getCollection(Number(collectionId));
  }, [api?.collection, collections]);

  return {
    collections,
    isFetching,
    getCollection
  };
};
