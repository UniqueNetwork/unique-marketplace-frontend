import React, { FC, useCallback } from 'react';
import styled from 'styled-components/macro';

import PricesFilter from '../../../components/Filters/PricesFilter';
import { FiltersProps, PriceRange } from '../../../components/Filters/types';
import CollectionsFilter from '../../../components/Filters/CollectionsFilter';
import { MyTokensFilterState, MyTokensStatuses } from './types';
import StatusFilter from './StatusFilter';

export const Filters: FC<FiltersProps<MyTokensFilterState>> = ({ value, onFilterChange }) => {
  const onStatusFilterChange = useCallback((statuses: MyTokensStatuses) => {
    onFilterChange({ ...(value || {}), statuses });
  }, [value, onFilterChange]);

  const onPricesFilterChange = useCallback((prices: PriceRange | undefined) => {
    onFilterChange({ ...(value || {}), prices });
  }, [value, onFilterChange]);

  const onCollectionsFilterChange = useCallback((collections: number[], traits?: string[]) => {
    onFilterChange(({ ...(value || {}), collections, traits }));
  }, [value, onFilterChange]);

  const onCollectionTraitsFilterChange = useCallback((traits: string[]) => {
    onFilterChange({ ...(value || {}), traits });
  }, [value, onFilterChange]);

  return <FiltersStyled>
    <StatusFilter value={value?.statuses} onChange={onStatusFilterChange}/>
    <PricesFilter value={value?.prices} onChange={onPricesFilterChange} />
    <CollectionsFilter value={value} onChange={onCollectionsFilterChange} onTraitsChange={onCollectionTraitsFilterChange} />
  </FiltersStyled>;
};

const FiltersStyled = styled.div`
  width: 235px;
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) * 2);
`;
