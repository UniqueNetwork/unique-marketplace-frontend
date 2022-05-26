import React, { FC, useCallback } from 'react';
import styled from 'styled-components/macro';
import { Checkbox, Text } from '@unique-nft/ui-kit';
import Accordion from '../Accordion/Accordion';
import CheckboxSkeleton from '../Skeleton/CheckboxSkeleton';
import { AttributeItem } from './types';
import { Attribute } from '../../api/restApi/offers/types';

interface AttributesFilterProps {
  selectedAttributes?: AttributeItem[]
  attributes: Record<string, Attribute[]>
  isAttributesFetching?: boolean
  onAttributesChange?(value: { key: string, attribute: string }[]): void
}

const AttributesFilter: FC<AttributesFilterProps> = ({ selectedAttributes = [], attributes, isAttributesFetching, onAttributesChange }) => {
  const onAttributeSelect = useCallback((attributeItem: AttributeItem) => (value: boolean) => {
    let _selectedAttributes;
    if (value) {
      _selectedAttributes = [...selectedAttributes, attributeItem];
    } else {
      _selectedAttributes = selectedAttributes.filter((item) => !(item.attribute === attributeItem.attribute && item.key === attributeItem.key));
    }
    onAttributesChange?.(_selectedAttributes);
  }, [onAttributesChange, selectedAttributes]);

  const onClear = useCallback((attributeName: string) => () => {
    onAttributesChange?.(selectedAttributes?.filter((attribute) => attributeName !== attribute.key));
  }, [onAttributesChange, selectedAttributes]);

  return (<AttributesFilterWrapper>
    {isAttributesFetching && Array.from({ length: 3 }).map((_, index) => <CheckboxSkeleton key={`checkbox-skeleton-${index}`} />)}
    {Object.keys(attributes).map((attributeName) => (
      <Accordion title={attributeName}
        isOpen={true}
        onClear={onClear(attributeName)}
        isClearShow={selectedAttributes?.some((attribute) => attributeName === attribute.key)}
      >
        <CollectionFilterWrapper>
          {attributes[attributeName].map((attribute) => (
            <AttributeWrapper key={`attribute-${attribute.key}`}>
              <Checkbox
                checked={selectedAttributes.findIndex((item) => item.key === attributeName && item.attribute === attribute.key) !== -1}
                label={attribute.key}
                size={'m'}
                onChange={onAttributeSelect({ key: attributeName, attribute: attribute.key })}
              />
              <Text color={'grey-500'}>{attribute.count.toString()}</Text>
            </AttributeWrapper>
            ))}
        </CollectionFilterWrapper>
      </Accordion>))}
  </AttributesFilterWrapper>);
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

export default AttributesFilter;
