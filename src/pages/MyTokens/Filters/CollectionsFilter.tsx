import React, { FC, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Checkbox, Text } from '@unique-nft/ui-kit';
import Accordion from 'components/Accordion/Accordion';
import AttributeCountsFilter from 'components/Filters/AttributeCountsFilter';
import AttributesFilter from 'components/Filters/AttributesFilter';
import CheckboxSkeleton from 'components/Skeleton/CheckboxSkeleton';
import { AttributeItem } from 'components/Filters/types';
import { CollectionCover } from 'components/CollectionCover/CollectionCover';
import { NFTCollection, NFTToken } from 'api/uniqueSdk/types';
import { Attribute, AttributeCount } from 'api/restApi/offers/types';
import { getAttributesCountFromTokens, getAttributesFromTokens } from './utils/attributes';

interface CollectionsFilterProps {
  value?: { collections?: number[], attributes?: { key: string, attribute: string }[], attributeCounts?: number[] } | null
  onChange(collections: number[], attributes?: AttributeItem[], attributeCounts?: number[]): void
  onAttributesChange?(value: { key: string, attribute: string }[]): void
  onAttributeCountsChange?(value: number[]): void
  testid: string
  featuredTokens: NFTToken[]
  tokens: NFTToken[]
  collections: NFTCollection[]
  isFetchingTokens: boolean
}

const CollectionsFilter: FC<CollectionsFilterProps> = ({
  value,
  onChange,
  onAttributesChange,
  onAttributeCountsChange,
  testid,
  featuredTokens,
  collections: myCollections,
  isFetchingTokens,
  tokens
}) => {
  const [attributes, setAttributes] = useState<Record<string, Attribute[]>>({});
  const [attributeCounts, setAttributeCounts] = useState<AttributeCount[]>([]);
  const [tokensForAttributeCounts, setTokensForAttributeCounts] = useState(tokens);
  const { collections: selectedCollections = [], attributes: selectedAttributes = [], attributeCounts: selectedAttributeCounts = [] } = value || {};

  useEffect(() => {
    // based on the amount of selected collections we calculate attribute counts either by all tokens either by filtered tokens
    if (selectedCollections.length === 1) {
      setTokensForAttributeCounts(featuredTokens);
    } else setTokensForAttributeCounts(tokens);
  }, [selectedCollections, tokens, featuredTokens, selectedAttributes]);

  useEffect(() => {
    if (!isFetchingTokens) {
      setAttributeCounts(getAttributesCountFromTokens(tokens.length > 0 ? tokensForAttributeCounts : []));
    }
  }, [isFetchingTokens, tokens, tokensForAttributeCounts]);

  useEffect(() => {
    if (!isFetchingTokens && featuredTokens.length > 0 && selectedCollections.length === 1) {
      setAttributes(getAttributesFromTokens(featuredTokens));
    }
  }, [isFetchingTokens, featuredTokens, selectedCollections.length]);

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

  return (<>
    <Accordion title={'Collections'}
      isOpen={true}
      onClear={onCollectionsClear}
      isClearShow={selectedCollections.length > 0}
      testid={`${testid}-accordion`}
    >
      <CollectionFilterWrapper>
        {isFetchingTokens && Array.from({ length: 3 }).map((_, index) => <CheckboxSkeleton key={`checkbox-skeleton-${index}`} />)}
        {!isFetchingTokens && myCollections.map((collection) => (
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
              testid={`${testid}-name-${collection.id}`}
            >{collection.collectionName || ''}</Text>
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
