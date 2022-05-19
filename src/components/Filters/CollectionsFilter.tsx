import React, { FC, useCallback, useEffect } from 'react';
import styled from 'styled-components/macro';
import { Checkbox, Text } from '@unique-nft/ui-kit';
import { useTraits } from '../../api/restApi/offers/traits';
import { useCollections } from '../../hooks/useCollections';
import Accordion from '../Accordion/Accordion';
import { Avatar } from '../Avatar/Avatar';
import { Trait } from '../../api/restApi/offers/types';
import CheckboxSkeleton from '../Skeleton/CheckboxSkeleton';

interface CollectionsFilterProps {
  value?: { collections?: number[], traits?: string[] } | null
  onChange(collections: number[], traits?: string[]): void
  onTraitsChange?(value: string[]): void
}

const CollectionsFilter: FC<CollectionsFilterProps> = ({ value, onChange, onTraitsChange }) => {
  const { collections, isFetching } = useCollections();
  const { traits, fetch: fetchTraits, reset: resetTraits, isFetching: isTraitsFetching } = useTraits();
  const { collections: selectedCollections = [], traits: selectedTraits = [] } = value || {};

  useEffect(() => {
    if (selectedCollections.length === 1 && !isTraitsFetching) fetchTraits(selectedCollections[0]);
  }, []);

  const onCollectionSelect = useCallback((collectionId: number) => (value: boolean) => {
    let _selectedCollections;
    if (value) {
      _selectedCollections = [...selectedCollections, collectionId];
    } else {
      _selectedCollections = selectedCollections.filter((item) => item !== collectionId);
    }
    // since traits are shown only if one collection is selected -> we should always reset them
    onChange(_selectedCollections, []);

    if (_selectedCollections.length === 1) fetchTraits(_selectedCollections[0]);
    else resetTraits();
  }, [selectedCollections, fetchTraits, resetTraits, onTraitsChange]);

  const onAttributeSelect = useCallback((trait: Trait) => (value: boolean) => {
    let _selectedTraits;
    if (value) {
      _selectedTraits = [...selectedTraits, trait.trait];
    } else {
      _selectedTraits = selectedTraits.filter((item) => item !== trait.trait);
    }
    onTraitsChange?.(_selectedTraits);
  }, [onTraitsChange, selectedTraits]);

  const onCollectionsClear = useCallback(() => {
    onChange([], []);
  }, [onChange]);

  return (<>
    <Accordion title={'Collections'}
      isOpen={true}
      onClear={onCollectionsClear}
      isClearShow={selectedCollections.length > 0}
    >
      <CollectionFilterWrapper>
        {isFetching && Array.from({ length: 3 }).map((_, index) => <CheckboxSkeleton key={`checkbox-skeleton-${index}`} />)}
        {collections.map((collection) => (
          <CheckboxWrapper
            key={`collection-${collection.id}`}
          >
            <Checkbox
              checked={selectedCollections.indexOf(collection.id) !== -1}
              label={''}
              size={'m'}
              onChange={onCollectionSelect(collection.id)}
            />
            <Avatar src={collection.coverImageUrl} size={22} type={'circle'}/>
            <Text>{collection.collectionName || ''}</Text>
          </CheckboxWrapper>
          ))}
      </CollectionFilterWrapper>
    </Accordion>
    {onTraitsChange && selectedCollections.length === 1 && <AttributesFilterWrapper>
      <Accordion title={'Traits'} isOpen={true}>
        <CollectionFilterWrapper>
          {isTraitsFetching && Array.from({ length: 3 }).map((_, index) => <CheckboxSkeleton key={`checkbox-skeleton-${index}`} />)}
          {traits.map((trait) => (
            <AttributeWrapper key={`attribute-${trait.trait}`}>
              <Checkbox
                checked={selectedTraits.indexOf(trait.trait) !== -1}
                label={trait.trait}
                size={'m'}
                onChange={onAttributeSelect(trait)}
              />
              <Text color={'grey-400'}>{trait.count.toString()}</Text>
            </AttributeWrapper>
          ))}
        </CollectionFilterWrapper>
      </Accordion>
    </AttributesFilterWrapper>}
  </>);
};

const CollectionFilterWrapper = styled.div`
  position: relative;
  margin-top: var(--gap);
  padding-top: 2px;
  display: flex;
  flex-direction: column;
  row-gap: var(--gap);
  min-height: 50px;
  max-height: 400px;
  overflow-y: auto;
  .unique-checkbox-wrapper label {
    max-width: 230px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;
const AttributesFilterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: var(--gap);

  .unique-checkbox-wrapper label {
    max-width: 230px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const AttributeWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding-right: 8px;
  box-sizing: border-box;
`;

const CheckboxWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 4);
  align-items: flex-start;
`;

export default CollectionsFilter;
