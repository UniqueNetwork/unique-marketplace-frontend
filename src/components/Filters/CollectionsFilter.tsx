import React, { FC, useCallback, useState } from 'react';
import styled from 'styled-components/macro';
import { collections as gqlCollections } from '../../api/graphQL';
import { Checkbox } from '@unique-nft/ui-kit';
import Accordion from '../Accordion/Accordion';

interface CollectionsFilterProps {
  onChange(value: number[]): void
}

const CollectionsFilter: FC<CollectionsFilterProps> = ({ onChange }) => {
  const { collections } = gqlCollections.useGraphQlCollections({});

  const [selectedCollections, setSelectedCollections] = useState<number[]>([]);

  const onCollectionSelect = useCallback((collectionId: number) => (value: boolean) => {
    let _selectedCollections;
    if (value) {
      _selectedCollections = [...selectedCollections, collectionId];
    } else {
      _selectedCollections = selectedCollections.filter((item) => item !== collectionId);
    }
    onChange(_selectedCollections);
    setSelectedCollections(_selectedCollections);
  }, [selectedCollections]);

  const onAttributeSelect = useCallback(() => (value: boolean) => {

  }, []);

  return (<>
    <CollectionFilterWrapper>
      {collections.map((collection) => (
        <Checkbox checked={selectedCollections.indexOf(collection.collection_id) !== -1}
          label={collection.name}
          size={'m'}
          onChange={onCollectionSelect(collection.collection_id)}
          key={`collection-${collection.collection_id}`}
        />
        ))}
    </CollectionFilterWrapper>
    {selectedCollections.length === 1 && <AttributesFilterWrapper>
      {/* TODO: make mapping attributes of the selected collection */}
      <Accordion title={'Traits'} isOpen={true}>
        <CollectionFilterWrapper>
          <Checkbox checked={false}
            label={'Pirate Eye'}
            size={'m'}
            onChange={onAttributeSelect()}
            key={'attribute-'}
          />
        </CollectionFilterWrapper>
      </Accordion>
    </AttributesFilterWrapper>}
  </>);
};

const CollectionFilterWrapper = styled.div`
  margin-top: var(--gap);
  padding-top: 2px;
  display: flex;
  flex-direction: column;
  row-gap: var(--gap);
  min-height: 20px;
  max-height: 400px;
  overflow-y: auto;
  .unique-checkbox-wrapper label {
    max-width: 230px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;
const AttributesFilterWrapper = styled.div`
  margin-top: calc(var(--gap) * 2);
  display: flex;
  flex-direction: column;
  row-gap: var(--gap);

  .unique-checkbox-wrapper label {
    max-width: 230px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

export default CollectionsFilter;
