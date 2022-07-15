import React, { FC, useCallback } from 'react';
import styled from 'styled-components';
import { Checkbox, Text } from '@unique-nft/ui-kit';
import { useCollections } from '../../hooks/useCollections';
import Accordion from '../Accordion/Accordion';
import CheckboxSkeleton from '../Skeleton/CheckboxSkeleton';
import { AttributeItem } from './types';
import AttributesFilter from './AttributesFilter';
import AttributeCountsFilter from './AttributeCountsFilter';
import { useApi } from '../../hooks/useApi';
import { Attribute, AttributeCount } from '../../api/restApi/offers/types';
import { CollectionCover } from '../CollectionCover/CollectionCover';

interface CollectionsFilterProps {
  value?: { collections?: number[], attributes?: { key: string, attribute: string }[], attributeCounts?: number[] } | null
  attributes?: Record<string, Attribute[]>
  attributeCounts?: AttributeCount[]
  onChange(collections: number[], attributes?: AttributeItem[], attributeCounts?: number[]): void
  onAttributesChange?(value: { key: string, attribute: string }[]): void
  onAttributeCountsChange?(value: number[]): void
  testid: string
}

const CollectionsFilter: FC<CollectionsFilterProps> = ({ value, attributes, attributeCounts, onChange, onAttributesChange, onAttributeCountsChange, testid }) => {
  const { collections, isFetching } = useCollections();
  const { collections: selectedCollections = [], attributes: selectedAttributes = [], attributeCounts: selectedAttributeCounts = [] } = value || {};
  const { settings } = useApi();

  const onCollectionSelect = useCallback((collectionId: number) => (value: boolean) => {
    let _selectedCollections;
    if (value) {
      _selectedCollections = [...selectedCollections, collectionId];
    } else {
      _selectedCollections = selectedCollections.filter((item) => item !== collectionId);
    }
    onChange(_selectedCollections);
  }, [selectedCollections, selectedAttributeCounts, onAttributesChange, onChange, settings?.blockchain.unique.collectionIds]);

  const onCollectionsClear = useCallback(() => {
    onChange([]);
  }, [onChange]);

  return (<>
    <Accordion title={'Collections'}
      isOpen={true}
      onClear={onCollectionsClear}
      isClearShow={selectedCollections.length > 0}
      testid={`${testid}-accordion`}
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
              testid={`${testid}-checkbox-${collection.id}`}
            />
            <CollectionCover src={collection.coverImageUrl} size={22} type={'circle'}/>
            <Text
              // @ts-ignore
              testid={`${testid}-name-${collection.id}`}
            >{collection.collectionName || ''}</Text>
          </CheckboxWrapper>
          ))}
      </CollectionFilterWrapper>
    </Accordion>
    {onAttributeCountsChange && !!attributeCounts?.length && <AttributeCountsFilter
      attributeCounts={attributeCounts}
      selectedAttributeCounts={selectedAttributeCounts}
      onAttributeCountsChange={onAttributeCountsChange}
      testid={`${testid}-attribute-count`}
    />}
    {onAttributesChange && selectedCollections.length === 1 && <AttributesFilter
      attributes={attributes || {}}
      selectedAttributes={selectedAttributes}
      onAttributesChange={onAttributesChange}
      testid={`${testid}-attributes`}
    />}
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

const CheckboxWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 4);
  align-items: flex-start;
`;

export default CollectionsFilter;
