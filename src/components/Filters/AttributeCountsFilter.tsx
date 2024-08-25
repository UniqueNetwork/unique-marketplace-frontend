import React, { FCC, useCallback } from 'react';
import styled from 'styled-components';
import { Checkbox, Text } from 'components/UI';
import { Accordion } from '../Accordion/Accordion';
import CheckboxSkeleton from '../Skeleton/CheckboxSkeleton';
import { AttributeCount } from '../../api/restApi/offers/types';
import { sortAttributeCounts } from './utils/sortAttributes';

interface AttributeCountsFilterProps {
  attributeCounts?: AttributeCount[]
  selectedAttributeCounts: number[]
  isAttributeCountsFetching?: boolean
  onAttributeCountsChange?(value: number[]): void
  testid: string
  disabled?: boolean
}

const AttributeCountsFilter: FCC<AttributeCountsFilterProps> = ({ attributeCounts = [], selectedAttributeCounts = [], isAttributeCountsFetching, onAttributeCountsChange, testid, disabled }) => {
  const onAttributeCountSelect = useCallback((attributeCount: number) => (value: boolean) => {
    let _selectedAttributeCounts;
    if (value) {
      _selectedAttributeCounts = [...selectedAttributeCounts, attributeCount];
    } else {
      _selectedAttributeCounts = selectedAttributeCounts.filter((item) => item !== attributeCount);
    }
    onAttributeCountsChange?.(_selectedAttributeCounts);
  }, [onAttributeCountsChange, selectedAttributeCounts]);

  const onClear = useCallback(() => {
    onAttributeCountsChange?.([]);
  }, [onAttributeCountsChange]);

  return (<AttributesFilterWrapper>
    <Accordion title={'Attribute count'}
      isOpen={true}
      onClear={onClear}
      isClearShow={selectedAttributeCounts.length > 0}
    >
      <CollectionFilterWrapper>
        {isAttributeCountsFetching && Array.from({ length: 3 }).map((_, index) => <CheckboxSkeleton key={`checkbox-skeleton-${index}`} />)}
        {attributeCounts.sort(sortAttributeCounts).map((attributeCount) => (
          <AttributeWrapper key={`attribute-${attributeCount.numberOfAttributes}`}>
            <Checkbox
              checked={selectedAttributeCounts.indexOf(attributeCount.numberOfAttributes) !== -1}
              label={attributeCount.numberOfAttributes.toString()}
              size={'m'}
              onChange={onAttributeCountSelect(attributeCount.numberOfAttributes)}
              testid={`${testid}-checkbox`}
              disabled={disabled}
            />
            <Text
              testid={`${testid}-amount-${attributeCount.amount}`}
              color={'grey-500'}
            >{attributeCount.amount.toString()}</Text>
          </AttributeWrapper>
              ))}
      </CollectionFilterWrapper>
    </Accordion>
  </AttributesFilterWrapper>);
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

const AttributesFilterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: var(--prop-gap);

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

export default AttributeCountsFilter;
