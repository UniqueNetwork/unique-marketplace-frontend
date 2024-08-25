import React, { FCC, useCallback, useEffect, useMemo, useState } from 'react';
import { Checkbox, Text } from 'components/UI';
import styled from 'styled-components';

import { Accordion } from 'components/Accordion/Accordion';
import AttributeCountsFilter from 'components/Filters/AttributeCountsFilter';
import AttributesFilter from 'components/Filters/AttributesFilter';
import CheckboxSkeleton from 'components/Skeleton/CheckboxSkeleton';
import { AttributeItem } from 'components/Filters/types';
import { CollectionCover } from 'components/CollectionCover/CollectionCover';
import { Attribute, AttributeCount } from 'api/restApi/offers/types';
import { getAttributesCountFromTokens, getAttributesFromTokens } from './utils/attributes';
import { getIpfsUriByImagePath } from 'utils/urlUtils';
import SearchField from 'components/SearchField/SearchField';
import { GQLCollection } from 'api/scanApi/types';
import { MixedMyTokenAndOffer } from '../types';

interface CollectionsFilterProps {
  value?: { collections?: number[], attributes?: { key: string, attribute: string }[], attributeCounts?: number[] } | null
  onChange(collections: number[], attributes?: AttributeItem[], attributeCounts?: number[]): void
  onAttributesChange?(value: { key: string, attribute: string }[]): void
  onAttributeCountsChange?(value: number[]): void
  testid: string
  featuredTokens: MixedMyTokenAndOffer[]
  tokens: MixedMyTokenAndOffer[]
  collections: GQLCollection[]
  isFetchingTokens: boolean
  featuredTokensForAttributeCounts: MixedMyTokenAndOffer[]
}

const CollectionsFilter: FCC<CollectionsFilterProps> = ({
  value,
  onChange,
  onAttributesChange,
  onAttributeCountsChange,
  testid,
  featuredTokens,
  collections: myCollections,
  isFetchingTokens,
  tokens,
  featuredTokensForAttributeCounts
}) => {
  const [attributes, setAttributes] = useState<Record<string, Attribute[]>>({});
  const [attributeCounts, setAttributeCounts] = useState<AttributeCount[]>([]);
  const { collections: selectedCollections = [], attributes: selectedAttributes = [], attributeCounts: selectedAttributeCounts = [] } = value || {};
  const [searchString, setSearchString] = useState<string>();

  useEffect(() => {
    if (!isFetchingTokens && tokens.length > 0) {
      setAttributeCounts(getAttributesCountFromTokens(featuredTokensForAttributeCounts));
    }
  }, [isFetchingTokens, tokens, featuredTokensForAttributeCounts]);

  useEffect(() => {
    if (!isFetchingTokens && featuredTokens.length > 0 && selectedCollections.length === 1) {
      setAttributes(getAttributesFromTokens(featuredTokens));
    }
  }, [isFetchingTokens, featuredTokens, selectedCollections.length]);

  useEffect(() => {
    if (!myCollections.length) {
      setAttributeCounts([]);
      setAttributes({});
    }
  }, [myCollections]);

  const onCollectionSelect = useCallback((collectionId: number) => (value: boolean) => {
    let _selectedCollections;
    if (value) {
      _selectedCollections = [...selectedCollections, collectionId];
    } else {
      _selectedCollections = selectedCollections.filter((item) => item !== collectionId);
    }

    // since traits are shown only if one collection is selected -> we should always reset them
    onChange(_selectedCollections, [], []);
  }, [selectedCollections, onChange]);

  const onCollectionsClear = useCallback(() => {
    onChange([], [], []);
  }, [onChange]);

  const filteredCollections = useMemo(() => {
    if (!searchString) return myCollections;
    return myCollections.filter(({ name }) => name.toLowerCase().includes(searchString.toLowerCase()));
  }, [myCollections, searchString]);

  return (<>
    <Accordion title={'Collections'}
      isOpen={true}
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
        {isFetchingTokens && Array.from({ length: 3 }).map((_, index) => <CheckboxSkeleton key={`checkbox-skeleton-${index}`} />)}
        {!isFetchingTokens && filteredCollections.map((collection) => (
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
            <CollectionCover src={getIpfsUriByImagePath(collection.cover || '')} size={22} type={'circle'}/>
            <Text
              testid={`${testid}-name-${collection.id}`}
            >{collection.name || ''}</Text>
          </CheckboxWrapper>
        ))}
      </CollectionFilterWrapper>
    </Accordion>
    {(!isFetchingTokens && !!attributeCounts.length) && <AttributeCountsFilter
      attributeCounts={attributeCounts}
      selectedAttributeCounts={selectedAttributeCounts}
      onAttributeCountsChange={onAttributeCountsChange}
      isAttributeCountsFetching={isFetchingTokens}
      testid={`${testid}-attribute-count`}
    />}
    {(onAttributesChange && selectedCollections.length === 1) && <AttributesFilter
      attributes={attributes}
      selectedAttributes={selectedAttributes}
      onAttributesChange={onAttributesChange}
      isAttributesFetching={isFetchingTokens}
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
  .unique-checkbox-wrapper label {
    max-width: 230px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--prop-gap) / 4);
  align-items: flex-start;
`;

const SearchFieldWrapper = styled.div`
  margin-top: calc(var(--prop-gap) / 2);
`;

export default CollectionsFilter;
