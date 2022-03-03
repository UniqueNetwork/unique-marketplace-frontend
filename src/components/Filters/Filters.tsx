import React, { FC, useCallback, useContext } from 'react';
import styled from 'styled-components/macro';

import Accordion from '../Accordion/Accordion';
import StatusFilter from './StatusFilter';
import PricesFilter from './PricesFilter';
import { FilterState, PriceRange, Statuses } from './types';
import CollectionsFilter from './CollectionsFilter';
import AccountContext from '../../account/AccountContext';

type FiltersProps = {
  onFilterChange(value: FilterState): void
}

export const Filters: FC<FiltersProps> = ({ onFilterChange }) => {
  const { selectedAccount } = useContext(AccountContext);

  const onStatusFilterChange = useCallback((value: Statuses) => {
    const newFilter = {
      seller: value.myNFTs ? selectedAccount?.address : undefined
    };
    onFilterChange(newFilter);
  }, [onFilterChange]);

  const onPricesFilterChange = useCallback((value: PriceRange | undefined) => {
    const { minPrice, maxPrice } = (value as PriceRange) || {};
    const newFilter = { minPrice, maxPrice };
    onFilterChange(newFilter);
  }, [onFilterChange]);

  const onCollectionsFilterChange = useCallback((value: number[]) => {
    const newFilter = { collectionId: value };
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
