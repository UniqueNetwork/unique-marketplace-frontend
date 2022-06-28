import React, { FC, useCallback, useMemo } from 'react';
import styled from 'styled-components/macro';
import { Checkbox, Text } from '@unique-nft/ui-kit';
import Accordion from '../../../components/Accordion/Accordion';
import { Avatar } from '../../../components/Avatar/Avatar';
import CheckboxSkeleton from '../../../components/Skeleton/CheckboxSkeleton';
import { AttributeItem } from './types';
import AttributesFilter from '../../../components/Filters/AttributesFilter';
import AttributeCountsFilter from '../../../components/Filters/AttributeCountsFilter';
import { NFTCollection, NFTToken } from '../../../api/chainApi/unique/types';
import { Attribute, AttributeCount } from '../../../api/restApi/offers/types';

interface CollectionsFilterProps {
  value?: { collections?: number[], attributes?: { key: string, attribute: string }[], attributeCounts?: number[] } | null
  onChange(collections: number[], attributes?: AttributeItem[], attributeCounts?: number[]): void
  onAttributesChange?(value: { key: string, attribute: string }[]): void
  onAttributeCountsChange?(value: number[]): void
  tokens: NFTToken[]
  collections: NFTCollection[]
  isFetchingTokens: boolean
}

const CollectionsFilter: FC<CollectionsFilterProps> = ({
  value,
  onChange,
  onAttributesChange,
  onAttributeCountsChange,
  tokens,
  collections: myCollections,
  isFetchingTokens
}) => {
  const { collections: selectedCollections = [], attributes: selectedAttributes = [], attributeCounts: selectedAttributeCounts = [] } = value || {};

  const myAttributesCount = useMemo(() => {
    // count attributes in each token
    const countTokenAttributes = tokens.map((token) => {
      if (!token?.attributes) return 0;
      let count = 0;
      if (token?.attributes?.Traits) count = token?.attributes?.Traits.length;
      return token?.attributes?.Gender ? ++count : count;
    });
    // count tokens with the same amount of attributes, result be like { 7: 2, 6: 1 }
    const counterMap: any = {};
    countTokenAttributes.forEach((count) => {
      if (counterMap[count]) counterMap[count]++;
      else counterMap[count] = 1;
    });
    // convert to format [{ "numberOfAttributes": 7,"amount": 2 }, { "numberOfAttributes": 6,"amount": 1 }]
    const result: AttributeCount[] = [];
    for (const attributesCount of Object.keys(counterMap)) {
      result.push({ numberOfAttributes: Number(attributesCount), amount: counterMap[attributesCount] });
    }
    return result;
  }, [tokens]);

  const myAttributes = useMemo<Record<string, Attribute[]>>(() => {
    if (selectedCollections.length === 1) {
      // get list of all attributes for all tokens
      let allAttributes: string[] = [];
      tokens.forEach((token) => {
        if (token?.attributes?.Traits) {
          allAttributes = [...allAttributes, ...token.attributes.Traits];
        }
      });
      // count every attribute
      const counterMap: any = {};
      allAttributes.forEach((attribute) => {
        if (counterMap[attribute]) counterMap[attribute]++;
        else counterMap[attribute] = 1;
      });
      const result: Attribute[] = [];
      for (const attribute of Object.keys(counterMap)) {
        result.push({ key: attribute, count: counterMap[attribute] });
      }
      return { Traits: result };
    }
    return { Traits: [] };
  }, [tokens, selectedCollections]);

  const onCollectionSelect = useCallback((collectionId: number) => (value: boolean) => {
    let _selectedCollections;
    if (value) {
      _selectedCollections = [...selectedCollections, collectionId];
    } else {
      _selectedCollections = selectedCollections.filter((item) => item !== collectionId);
    }
    // since traits are shown only if one collection is selected -> we should always reset them
    onChange(_selectedCollections, [], []);

    // if (_selectedCollections.length === 1) fetchAttributes(_selectedCollections[0]);
    // else resetAttributes();

    // if (_selectedCollections.length > 0) fetchAttributeCounts(_selectedCollections);
    // else fetchAttributeCounts(settings?.blockchain.unique.collectionIds || []);
  }, [selectedCollections, onChange]);

  const onCollectionsClear = useCallback(() => {
    onChange([], [], []);
  }, [onChange]);

  return (<>
    <Accordion title={'Collections'}
      isOpen={true}
      onClear={onCollectionsClear}
      isClearShow={selectedCollections.length > 0}
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
            />
            <Avatar src={collection.coverImageUrl} size={22} type={'circle'}/>
            <Text>{collection.collectionName || ''}</Text>
          </CheckboxWrapper>
          ))}
      </CollectionFilterWrapper>
    </Accordion>
    {!isFetchingTokens && myAttributesCount.length > 0 && <AttributeCountsFilter
      attributeCounts={myAttributesCount}
      selectedAttributeCounts={selectedAttributeCounts}
      isAttributeCountsFetching={isFetchingTokens}
      onAttributeCountsChange={onAttributeCountsChange}
    />}
    {!isFetchingTokens && selectedCollections.length === 1 && <AttributesFilter
      attributes={myAttributes}
      selectedAttributes={selectedAttributes}
      isAttributesFetching={isFetchingTokens}
      onAttributesChange={onAttributesChange}
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
