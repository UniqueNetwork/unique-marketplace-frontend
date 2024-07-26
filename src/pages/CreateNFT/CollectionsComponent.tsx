import { FC } from 'react';
import styled from 'styled-components/macro';

import { GQLCollection } from 'api/scanApi/types';
import { CollectionCard } from './CollectionCard';

interface CollectionsComponentProps {
  collections: GQLCollection[],
  emitSelectCollection: (_collection: GQLCollection) => void
}

const CollectionsComponent: FC<CollectionsComponentProps> = ({ collections, emitSelectCollection }) => {
  return (
    <Wrapper>
      <ItemsCountWrapper>{collections.length || 0} {collections.length === 1 ? 'Collection' : 'Collections'}</ItemsCountWrapper>
      <CollectionsWrapper>
        {collections?.map &&
          collections.map((collection) => (
            <CollectionCard
              key={`collection-${collection.id}`}
              {...collection}
              onClick={() => emitSelectCollection(collection)}
            />
          ))}
      </CollectionsWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  cursor: pointer;
`;

const ItemsCountWrapper = styled.div`
  margin-bottom: 24px;
`;

const CollectionsWrapper = styled.div`
  // width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  position: relative;
  margin-bottom: calc(16px * 1.5);

  @media (max-width: 1199px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 767px) {
    border: none;
    padding: 0;
  }
`;

export default CollectionsComponent;
