import CollectionsContext from 'collections/CollectionsContext';
import { useContext } from 'react';

export const useCuratedCollections = () => {
  const { isFetching: isFetchingFeaturedCollections, curatedCollections } = useContext(CollectionsContext);
  return {
    curatedCollections,
    isFetchingCurated: isFetchingFeaturedCollections
  };
};
