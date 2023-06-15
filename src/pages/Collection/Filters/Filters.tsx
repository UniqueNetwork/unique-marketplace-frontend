import React, { FC, useCallback } from 'react';
import styled from 'styled-components';

import AttributeCountsFilter from 'components/Filters/AttributeCountsFilter';
import AttributesFilter from 'components/Filters/AttributesFilter';
import { AttributeItem, FiltersProps, PriceRange, Statuses } from 'components/Filters/types';
import { useAccounts } from 'hooks/useAccounts';
import StatusFilter from 'components/Filters/StatusFilter';
import PricesFilter from 'components/Filters/PricesFilter';
import { BelongingValue, TokensFilter } from './types';
import BelongingFilter from './BelongingFilter';

export const Filters: FC<FiltersProps<TokensFilter>> = ({ value, attributes, attributeCounts, onFilterChange, testid, disabled }) => {
  const { selectedAccount } = useAccounts();

  const onBelongingFilterChange = useCallback((belongingValue: BelongingValue) => {
    onFilterChange({ ...value, belongingValue });
  }, [value, onFilterChange, selectedAccount]);

  const onStatusFilterChange = useCallback((statuses: Statuses) => {
    onFilterChange({ ...value, statuses });
  }, [value, onFilterChange, selectedAccount]);

  const onPricesFilterChange = useCallback((prices: PriceRange | undefined) => {
    onFilterChange({ ...value, prices });
  }, [value, onFilterChange]);

  const onCollectionAttributesFilterChange = useCallback((attributes: AttributeItem[]) => {
    onFilterChange({ ...value, attributes });
  }, [value, onFilterChange]);

  const onCollectionAttributeCountsFilterChange = useCallback((attributeCounts: number[]) => {
    onFilterChange({ ...value, attributeCounts });
  }, [value, onFilterChange]);

  const { attributes: selectedAttributes = [], attributeCounts: selectedAttributeCounts = [] } = value || {};

  return <FiltersStyled>

    <BelongingFilter
      value={value?.belongingValue}
      onChange={onBelongingFilterChange}
      disabled={disabled}
    />
    <StatusFilter
      value={value?.statuses}
      onChange={onStatusFilterChange}
      testid={`${testid}-status`}
      disabled={disabled}
    />
    <PricesFilter
      value={value?.prices}
      onChange={onPricesFilterChange}
      testid={`${testid}-prices`}
      disabled={disabled}
    />
    {!!attributeCounts?.length && <AttributeCountsFilter
      attributeCounts={attributeCounts}
      selectedAttributeCounts={selectedAttributeCounts}
      onAttributeCountsChange={onCollectionAttributeCountsFilterChange}
      testid={`${testid}-attribute-count`}
      disabled={disabled}
    />}
    <AttributesFilter
      attributes={attributes || {}}
      selectedAttributes={selectedAttributes}
      onAttributesChange={onCollectionAttributesFilterChange}
      testid={`${testid}-attributes`}
      disabled={disabled}
    />
  </FiltersStyled>;
};

const FiltersStyled = styled.div`
  width: 235px;
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) * 2);

  @media (max-width: 1024px) {
    width: 100%;
  }
`;
