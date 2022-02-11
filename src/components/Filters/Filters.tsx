import React, { FC, useEffect, useReducer } from 'react';
import styled from 'styled-components/macro';
import Accordion from '../Accordion/Accordion';
import StatusFilter from './StatusFilter';
import PricesFilter from './PricesFilter';
import { FilterState, FilterReducer, PriceRange, Statuses } from './types';
import CollectionsFilter from './CollectionsFilter';

type FiltersProps = {
  onFilterChange(value: FilterState): void
}

export const Filters: FC<FiltersProps> = ({ onFilterChange }) => {
  const [filter, dispatch] = useReducer<FilterReducer>((state, { action, value }) => {
    if (action === 'status') {
      const { myNFTs } = (value || {}) as Statuses;
      return {
        ...state,
        seller: myNFTs ? 'current_account' : undefined // TODO: get current account address
        // TODO: What filter need apply for Fixed price, timed auction, my bets
      };
    }
    if (action === 'price') {
      const { minPrice, maxPrice } = (value as PriceRange) || {};
      return {
        ...state,
        minPrice,
        maxPrice
      };
    }
    if (action === 'collections') {
      return {
        ...state,
        collationId: value as number[]
      };
    }
    return state;
  }, {});

  useEffect(() => {
    onFilterChange(filter);
  }, [filter]);

  return <FiltersStyled>
    <Accordion title={'Status'} isOpen={true} >
      <StatusFilter onChange={(value) => dispatch({ action: 'status', value })}/>
    </Accordion>
    <Accordion title={'Price'} isOpen={true} >
      <PricesFilter onChange={(value) => dispatch({ action: 'price', value })} />
    </Accordion>
    <Accordion title={'Collections'} isOpen={true} >
      <CollectionsFilter onChange={(value) => dispatch({ action: 'collections', value })} />
    </Accordion>
  </FiltersStyled>;
};

const FiltersStyled = styled.div`
  width: 235px;
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) * 2);
`;
