import React, { FC, useCallback } from 'react';
import styled from 'styled-components';

import StatusFilter from './StatusFilter';
import PricesFilter from './PricesFilter';
import { AttributeItem, FiltersProps, PriceRange, Statuses } from './types';
import CollectionsFilter from './CollectionsFilter';
import { useAccounts } from '../../hooks/useAccounts';

export const Filters: FC<FiltersProps> = ({ value, attributes, attributeCounts, onFilterChange, testid }) => {
  const { selectedAccount } = useAccounts();

  const onStatusFilterChange = useCallback((statuses: Statuses) => {
    onFilterChange({ ...value, statuses });
  }, [value, onFilterChange, selectedAccount]);

  const onPricesFilterChange = useCallback((prices: PriceRange | undefined) => {
    onFilterChange({ ...value, prices });
  }, [value, onFilterChange]);

  const onCollectionsFilterChange = useCallback((collections: number[]) => {
    onFilterChange({ ...value, collections, attributes: [] });
  }, [value, onFilterChange]);

  const onCollectionAttributesFilterChange = useCallback((attributes: AttributeItem[]) => {
    onFilterChange({ ...value, attributes });
  }, [value, onFilterChange]);

  const onCollectionAttributeCountsFilterChange = useCallback((attributeCounts: number[]) => {
    onFilterChange({ ...value, attributeCounts });
  }, [value, onFilterChange]);

  return <FiltersStyled>
    <StatusFilter value={value?.statuses} onChange={onStatusFilterChange} testid={`${testid}-status`} />
    <PricesFilter value={value?.prices} onChange={onPricesFilterChange} testid={`${testid}-prices`} />
    <CollectionsFilter
      value={value}
      attributes={attributes}
      attributeCounts={attributeCounts}
      onChange={onCollectionsFilterChange}
      onAttributesChange={onCollectionAttributesFilterChange}
      onAttributeCountsChange={onCollectionAttributeCountsFilterChange}
      testid={`${testid}-collections`}
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
