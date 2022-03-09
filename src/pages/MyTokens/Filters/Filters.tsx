import React, { FC, useCallback } from 'react';
import styled from 'styled-components/macro';

import Accordion from '../../../components/Accordion/Accordion';
import PricesFilter from '../../../components/Filters/PricesFilter';
import { PriceRange } from '../../../components/Filters/types';
import CollectionsFilter from '../../../components/Filters/CollectionsFilter';
import { MyTokensStatuses } from './types';
import StatusFilter from './StatusFilter';

export type FilterState = Partial<MyTokensStatuses> & Partial<PriceRange> & { collectionIds?: number[] }

type FiltersProps = {
  onFilterChange(value: FilterState): void
}

export const Filters: FC<FiltersProps> = ({ onFilterChange }) => {
  const onStatusFilterChange = useCallback((value: MyTokensStatuses) => {
    onFilterChange(value);
  }, [onFilterChange]);

  const onPricesFilterChange = useCallback((value: PriceRange | undefined) => {
    const { minPrice, maxPrice } = (value as PriceRange) || {};
    const newFilter = { minPrice, maxPrice };
    onFilterChange(newFilter);
  }, [onFilterChange]);

  const onCollectionsFilterChange = useCallback((value: number[]) => {
    const newFilter = { collectionIds: value };
    onFilterChange(newFilter);
  }, [onFilterChange]);

  return <FiltersStyled>
    <Accordion title={'Status'} isOpen={true} >
      <StatusFilter onChange={onStatusFilterChange}/>
    </Accordion>
    <Accordion title={'Price'} isOpen={true} >
      <PricesFilter onChange={onPricesFilterChange} />
    </Accordion>
    <Accordion title={'Collections'} isOpen={true} >
      <CollectionsFilter onChange={onCollectionsFilterChange} />
    </Accordion>
  </FiltersStyled>;
};

const FiltersStyled = styled.div`
  width: 235px;
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) * 2);
`;
