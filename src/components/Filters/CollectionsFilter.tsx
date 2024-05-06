import React, { FC, useCallback, useContext, useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import styled from 'styled-components';
import { Checkbox, Text } from 'components/UI';
import { useCollections } from '../../hooks/useCollections';
import { Accordion } from '../Accordion/Accordion';
import CheckboxSkeleton from '../Skeleton/CheckboxSkeleton';
import { AttributeItem } from './types';
import AttributesFilter from './AttributesFilter';
import AttributeCountsFilter from './AttributeCountsFilter';
import { Attribute, AttributeCount } from '../../api/restApi/offers/types';
import { CollectionCover } from '../CollectionCover/CollectionCover';
import { useCuratedCollections } from 'hooks/useCuratedCollections';
import SearchField from 'components/SearchField/SearchField';
import CollectionsContext from 'collections/CollectionsContext';

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
  const { featuredCollections, isFetching } = useCollections();
  const { curatedCollections, isFetchingCurated } = useCuratedCollections();
  const { collections: selectedCollections = [], attributes: selectedAttributes = [], attributeCounts: selectedAttributeCounts = [] } = value || {};
  const [searchString, setSearchString] = useState<string>();
  const { offset, totalCount, fetchCollections } = useContext(CollectionsContext);

  const onCollectionSelect = useCallback((collectionId: number) => (value: boolean) => {
    let _selectedCollections;
    if (value) {
      _selectedCollections = [...selectedCollections, collectionId];
    } else {
      _selectedCollections = selectedCollections.filter((item) => item !== collectionId);
    }
    onChange(_selectedCollections);
  }, [selectedCollections, onChange]);

  const onCollectionsClear = useCallback(() => {
    onChange([]);
  }, [onChange]);

  const filteredCollections = useMemo(() => {
    if (!searchString) return featuredCollections;
    return featuredCollections.filter(({ name }) => name.toLowerCase().includes(searchString.toLowerCase()));
  }, [featuredCollections, searchString]);

  return (<>
    {curatedCollections.length > 0 && <Accordion title={'Curated collections'}
      isOpen={true}
      onClear={onCollectionsClear}
      isClearShow={selectedCollections.length > 0}
    >
      <CuratedCollectionFilterWrapper>
        {isFetchingCurated && Array.from({ length: 3 }).map((_, index) => <CheckboxSkeleton key={`checkbox-skeleton-${index}`} />)}
        {curatedCollections.map((collection) => (
          <CheckboxWrapper
            key={`collection-${collection.id}`}
          >
            <Checkbox
              checked={selectedCollections.indexOf(collection.id) !== -1}
              label={<CuratedCheckboxLabelWrapper>
                <CollectionCover src={collection.schema?.coverPicture.fullUrl || ''} size={22} type={'square'}/>
                <Text
                  testid={`${testid}-name-${collection.id}`}
                >{collection.name || ''}</Text>
              </CuratedCheckboxLabelWrapper>}
              size={'m'}
              onChange={onCollectionSelect(collection.id)}
              testid={`${testid}-checkbox-${collection.id}`}
            />
          </CheckboxWrapper>
          ))}
      </CuratedCollectionFilterWrapper>
    </Accordion>}
    <Accordion title={'All collections'}
      isOpen={curatedCollections.length === 0}
      onClear={onCollectionsClear}
      isClearShow={selectedCollections.length > 0}
    >
      <SearchFieldWrapper>
        <SearchField searchValue={searchString}
          onSearchStringChange={setSearchString}
          hideButton
          placeholder='Search by collections'
        />
      </SearchFieldWrapper>
      <CollectionFilterWrapper>
        <InfiniteScroll
          hasMore={offset < totalCount}
          initialLoad={false}
          loadMore={fetchCollections}
          pageStart={1}
          threshold={20}
          useWindow={false}
        >
          {isFetching && Array.from({ length: 3 }).map((_, index) => <CheckboxSkeleton key={`checkbox-skeleton-${index}`} />)}
          {filteredCollections.map((collection) => (
            <CheckboxWrapper
              key={`collection-${collection.id}`}
            >
              <Checkbox
                checked={selectedCollections.indexOf(collection.id) !== -1}
                label={<CheckboxLabelWrapper>
                  <CollectionCover src={collection?.cover || ''} size={22} type={'circle'}/>
                  <Text
                    testid={`${testid}-name-${collection.id}`}
                  >{collection.name || ''}</Text>
                </CheckboxLabelWrapper>}
                size={'m'}
                onChange={onCollectionSelect(collection.id)}
                testid={`${testid}-checkbox-${collection.id}`}
              />
            </CheckboxWrapper>
            ))}
        </InfiniteScroll>
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
  margin-top: var(--prop-gap);
  padding-top: 2px;
  display: flex;
  flex-direction: column;
  row-gap: var(--prop-gap);
  min-height: 50px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: var(--prop-gap);
  .unique-checkbox-wrapper label {
    max-width: 230px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const CuratedCollectionFilterWrapper = styled.div`
  position: relative;
  margin-top: var(--prop-gap);
  padding-top: 2px;
  display: flex;
  flex-direction: column;
  row-gap: var(--prop-gap);
  min-height: 50px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: var(--prop-gap);
  .unique-checkbox-wrapper {
    align-items: center;
  }
  .unique-checkbox-wrapper label {
    max-width: 230px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const CheckboxWrapper = styled.div`

`;

const CheckboxLabelWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--prop-gap) / 4);
  align-items: flex-start;
  cursor: pointer;
  .unique-text {
    text-overflow: ellipsis;
    overflow: hidden;
  }

`;

const CuratedCheckboxLabelWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--prop-gap) / 4);
  align-items: center;
  cursor: pointer;
  .unique-text {
    text-overflow: ellipsis;
    overflow: hidden;
  }
  & > div {
    height: 50px;
    width: 50px;
    min-width: 50px;
  }
  & > div > .picture > img {
    border-radius: 4px !important;
    height: 50px;
    width: 50px;
  }
`;

const SearchFieldWrapper = styled.div`
  margin-top: calc(var(--prop-gap) / 2);
`;

export default CollectionsFilter;
