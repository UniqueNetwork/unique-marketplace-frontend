import React, { Dispatch, FC, SetStateAction, useCallback } from 'react';
import styled from 'styled-components/macro';

import PricesFilter from '../../../components/Filters/PricesFilter';
import { PriceRange } from '../../../components/Filters/types';
import CollectionsFilter from '../../../components/Filters/CollectionsFilter';
import { MyTokensStatuses } from './types';
import { FilterChangeHandler } from '../../../components/Filters/MobileFilter';

export type MyTokensFilterState = Partial<MyTokensStatuses> & Partial<PriceRange> & { collectionIds?: number[] } & Partial<{ traits: string[] }>

type FiltersProps = {
  onFilterChange: FilterChangeHandler<MyTokensFilterState>
}

export const Filters: FC<FiltersProps> = ({ onFilterChange }) => {
  const onStatusFilterChange = useCallback((value: MyTokensStatuses) => {
    (onFilterChange as Dispatch<SetStateAction<MyTokensFilterState | null>>)((filters) => ({ ...filters, ...value }));
  }, [onFilterChange]);

  const onPricesFilterChange = useCallback((value: PriceRange | undefined) => {
    const { minPrice, maxPrice } = (value as PriceRange) || {};
    (onFilterChange as Dispatch<SetStateAction<MyTokensFilterState | null>>)((filters) => ({ ...filters, minPrice, maxPrice }));
  }, [onFilterChange]);

  const onCollectionsFilterChange = useCallback((collectionIds: number[]) => {
    (onFilterChange as Dispatch<SetStateAction<MyTokensFilterState | null>>)((filters) => ({ ...filters, collectionIds }));
  }, [onFilterChange]);

  const onStatusFilterClear = useCallback(() => {
    (onFilterChange as Dispatch<SetStateAction<MyTokensFilterState | null>>)((filters) => ({ ...filters }));
  }, [onFilterChange]);

  // const onCollectionTraitsFilterChange = useCallback((value: string[]) => {
  //   const newFilter = { traits: value };
  //   onFilterChange(newFilter);
  // }, [onFilterChange]);

  return <FiltersStyled>
    <CollectionsFilter onChange={onCollectionsFilterChange} />
    <PricesFilter onChange={onPricesFilterChange} />
  </FiltersStyled>;
};

const FiltersStyled = styled.div`
  width: 235px;
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) * 2);
`;
