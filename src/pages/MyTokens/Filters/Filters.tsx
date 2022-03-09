import React, { FC, useCallback, useEffect } from 'react';
import styled from 'styled-components/macro';

import Accordion from '../../../components/Accordion/Accordion';
import PricesFilter from '../../../components/Filters/PricesFilter';
import { PriceRange } from '../../../components/Filters/types';
import CollectionsFilter from '../../../components/Filters/CollectionsFilter';
import { MyTokensStatuses } from './types';
import StatusFilter from './StatusFilter';

export type FilterState = Partial<MyTokensStatuses> & Partial<PriceRange> & { collectionIds?: number[] }

type FiltersProps = {
  filters: FilterState
  onFilterChange(setState: (value: FilterState) => FilterState): void
}

export const Filters: FC<FiltersProps> = ({ filters, onFilterChange }) => {
  const onStatusFilterChange = useCallback((value: MyTokensStatuses) => {
    onFilterChange((filters) => ({ ...filters, ...value }));
  }, [onFilterChange]);

  const onPricesFilterChange = useCallback((value: PriceRange | undefined) => {
    const { minPrice, maxPrice } = (value as PriceRange) || {};
    onFilterChange((filters) => ({ ...filters, minPrice, maxPrice }));
  }, [onFilterChange]);

  const onCollectionsFilterChange = useCallback((collectionIds: number[]) => {
    onFilterChange((filters) => ({ ...filters, collectionIds }));
  }, [onFilterChange]);

  const onStatusFilterClear = useCallback(() => {
    onFilterChange((filters) => ({ ...filters }));
  }, [onFilterChange]);

  return <FiltersStyled>
    <StatusFilter onChange={onStatusFilterChange}/>
    <PricesFilter onChange={onPricesFilterChange} />
    <CollectionsFilter onChange={onCollectionsFilterChange} />
  </FiltersStyled>;
};

const FiltersStyled = styled.div`
  width: 235px;
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) * 2);
`;
