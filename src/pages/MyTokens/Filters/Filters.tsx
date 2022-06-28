import React, { FC, useCallback } from 'react';
import styled from 'styled-components';

import PricesFilter from '../../../components/Filters/PricesFilter';
import { PriceRange } from '../../../components/Filters/types';
import CollectionsFilter from './CollectionsFilter';
import { MyTokensFilterState, MyTokensStatuses, AttributeItem, FiltersProps } from './types';
import StatusFilter from './StatusFilter';

export const Filters: FC<FiltersProps<MyTokensFilterState>> = ({ value, onFilterChange, tokens, collections, isFetchingTokens }) => {
  const onStatusFilterChange = useCallback((statuses: MyTokensStatuses) => {
    onFilterChange({ ...(value || {}), statuses });
  }, [value, onFilterChange]);

  const onPricesFilterChange = useCallback((prices: PriceRange | undefined) => {
    onFilterChange({ ...(value || {}), prices });
  }, [value, onFilterChange]);

  const onCollectionsFilterChange = useCallback((collections: number[], attributes?: AttributeItem[], attributeCounts?: number[]) => {
    onFilterChange(({ ...(value || {}), collections, attributes, attributeCounts }));
  }, [value, onFilterChange]);

  const onCollectionAttributesFilterChange = useCallback((attributes: AttributeItem[]) => {
    onFilterChange({ ...(value || {}), attributes });
  }, [value, onFilterChange]);

  const onCollectionAttributeCountsFilterChange = useCallback((attributeCounts: number[]) => {
    onFilterChange({ ...(value || {}), attributeCounts });
  }, [value, onFilterChange]);

  return <FiltersStyled>
    <StatusFilter value={value?.statuses} onChange={onStatusFilterChange}/>
    <PricesFilter value={value?.prices} onChange={onPricesFilterChange} />
    <CollectionsFilter
      value={value}
      onChange={onCollectionsFilterChange}
      onAttributesChange={onCollectionAttributesFilterChange}
      onAttributeCountsChange={onCollectionAttributeCountsFilterChange}
      tokens={tokens}
      collections={collections}
      isFetchingTokens={isFetchingTokens}
    />
  </FiltersStyled>;
};

const FiltersStyled = styled.div`
  width: 235px;
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) * 2);
`;
