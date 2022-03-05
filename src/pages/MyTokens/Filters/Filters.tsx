import React, { FC, useCallback } from 'react';
import styled from 'styled-components/macro';

import Accordion from '../../../components/Accordion/Accordion';
import PricesFilter from '../../../components/Filters/PricesFilter';
import { FilterState, PriceRange } from '../../../components/Filters/types';
import CollectionsFilter from '../../../components/Filters/CollectionsFilter';
import { MyTokensStatuses } from './types';
import StatusFilter from './StatusFilter';
import { useAccounts } from '../../../hooks/useAccounts';

type FiltersProps = {
  onFilterChange(value: FilterState): void
}

export const Filters: FC<FiltersProps> = ({ onFilterChange }) => {
  const { selectedAccount } = useAccounts();

    const onStatusFilterChange = useCallback((value: MyTokensStatuses) => {
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
    const newFilter = { collationId: value };
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
