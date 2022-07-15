import React, { FC, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Checkbox, Text } from '@unique-nft/ui-kit';
import { useCollections } from '../../../hooks/useCollections';
import { useApi } from '../../../hooks/useApi';
import Accordion from 'components/Accordion/Accordion';
import AttributeCountsFilter from 'components/Filters/AttributeCountsFilter';
import AttributesFilter from 'components/Filters/AttributesFilter';
import CheckboxSkeleton from 'components/Skeleton/CheckboxSkeleton';
import { AttributeItem } from 'components/Filters/types';
import { useAttributes } from '../../../api/restApi/offers/attributes';
import { useAttributeCounts } from '../../../api/restApi/offers/attributeCounts';
import { CollectionCover } from 'components/CollectionCover/CollectionCover';

interface CollectionsFilterProps {
  value?: { collections?: number[], attributes?: { key: string, attribute: string }[], attributeCounts?: number[] } | null
  onChange(collections: number[], attributes?: AttributeItem[], attributeCounts?: number[]): void
  onAttributesChange?(value: { key: string, attribute: string }[]): void
  onAttributeCountsChange?(value: number[]): void
  testid: string
}

const CollectionsFilter: FC<CollectionsFilterProps> = ({ value, onChange, onAttributesChange, onAttributeCountsChange, testid }) => {
  const { collections, isFetching } = useCollections();
  const { attributes, fetch: fetchAttributes, reset: resetAttributes, isFetching: isAttributesFetching } = useAttributes();
  const { attributeCounts, fetch: fetchAttributeCounts, isFetching: isAttributeCountsFetching } = useAttributeCounts();
  const { collections: selectedCollections = [], attributes: selectedAttributes = [], attributeCounts: selectedAttributeCounts = [] } = value || {};
  const { settings } = useApi();

  useEffect(() => {
    if (selectedCollections.length === 1 && !isAttributesFetching) fetchAttributes(selectedCollections[0]);
  }, []);

  useEffect(() => {
    if (settings && settings.blockchain.unique.collectionIds.length > 0 && attributeCounts.length === 0) {
      fetchAttributeCounts(selectedCollections?.length ? selectedCollections : settings?.blockchain.unique.collectionIds || []);
    }
  }, [settings?.blockchain.unique.collectionIds]);

  const onCollectionSelect = useCallback((collectionId: number) => async (value: boolean) => {
    let _selectedCollections;
    if (value) {
      _selectedCollections = [...selectedCollections, collectionId];
    } else {
      _selectedCollections = selectedCollections.filter((item) => item !== collectionId);
    }

    if (_selectedCollections.length === 1) fetchAttributes(_selectedCollections[0]);
    else resetAttributes();

    const _attributeCounts = await fetchAttributeCounts(_selectedCollections.length > 0 ? _selectedCollections : settings?.blockchain.unique.collectionIds || []);
    const _selectedAttributeCounts = selectedAttributeCounts.filter((item) => _attributeCounts.findIndex(({ numberOfAttributes }) => numberOfAttributes === item) > -1);

    // since attributes are shown only if one collection is selected -> we should always reset them
    onChange(_selectedCollections, [], _selectedAttributeCounts);
  }, [selectedCollections, selectedAttributeCounts, onAttributesChange, onChange, settings?.blockchain.unique.collectionIds]);

  const onCollectionsClear = useCallback(() => {
    onChange([]);
    fetchAttributeCounts(settings?.blockchain.unique.collectionIds || []);
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
      isAttributeCountsFetching={isAttributeCountsFetching}
      testid={`${testid}-attribute-count`}
    />}
    {onAttributesChange && selectedCollections.length === 1 && <AttributesFilter
      attributes={attributes || {}}
      selectedAttributes={selectedAttributes}
      onAttributesChange={onAttributesChange}
      isAttributesFetching={isAttributesFetching}
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
