import React, { FC, useCallback } from 'react';
import styled from 'styled-components/macro';

import StatusFilter from './StatusFilter';
import PricesFilter from './PricesFilter';
import { AttributeItem, FiltersProps, PriceRange, Statuses } from './types';
import CollectionsFilter from './CollectionsFilter';
import { useAccounts } from '../../hooks/useAccounts';

export const Filters: FC<FiltersProps> = ({ value, onFilterChange }) => {
  const { selectedAccount } = useAccounts();

  const onStatusFilterChange = useCallback((statuses: Statuses) => {
    onFilterChange({ ...value, statuses });
  }, [value, onFilterChange, selectedAccount]);

  const onPricesFilterChange = useCallback((prices: PriceRange | undefined) => {
    onFilterChange({ ...value, prices });
  }, [value, onFilterChange]);

  const onCollectionsFilterChange = useCallback((collections: number[], attributes?: AttributeItem[], attributeCounts?: number[]) => {
    onFilterChange({ ...value, collections, attributes, attributeCounts });
  }, [value, onFilterChange]);

  const onCollectionAttributesFilterChange = useCallback((attributes: AttributeItem[]) => {
    onFilterChange({ ...value, attributes });
  }, [value, onFilterChange]);

  const onCollectionAttributeCountsFilterChange = useCallback((attributeCounts: number[]) => {
    onFilterChange({ ...value, attributeCounts });
  }, [value, onFilterChange]);

  return <FiltersStyled>
    <StatusFilter value={value?.statuses} onChange={onStatusFilterChange}/>
    <PricesFilter value={value?.prices} onChange={onPricesFilterChange} />
    <CollectionsFilter
      value={value}
      onChange={onCollectionsFilterChange}
      onAttributesChange={onCollectionAttributesFilterChange}
      onAttributeCountsChange={onCollectionAttributeCountsFilterChange}
    />
  </FiltersStyled>;
};

const FiltersStyled = styled.div`
  width: 235px;
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) * 2);
`;
