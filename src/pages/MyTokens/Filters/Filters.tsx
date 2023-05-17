import React, { FC, useCallback } from 'react';
import styled from 'styled-components';

import PricesFilter from 'components/Filters/PricesFilter';
import { AttributeItem, PriceRange, MyTokensFilterState, MyTokensStatuses, FilterChangeHandler } from './types';
import StatusFilter from './StatusFilter';
import CollectionsFilter from './CollectionsFilter';
import { MixedMyTokenAndOffer } from '../types';
import { MyCollection } from 'api/restApi/collections/types';

type FilterProps = {
  value: MyTokensFilterState | null
  onFilterChange: FilterChangeHandler<MyTokensFilterState>
  tokens: MixedMyTokenAndOffer[]
  featuredTokens: MixedMyTokenAndOffer[]
  collections: MyCollection[]
  isFetchingTokens: boolean
  testid: string
  featuredTokensForAttributeCounts: MixedMyTokenAndOffer[]
}

export const Filters: FC<FilterProps> = ({ value, onFilterChange, featuredTokens, collections, isFetchingTokens, testid, tokens, featuredTokensForAttributeCounts }) => {
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
    <StatusFilter value={value?.statuses} onChange={onStatusFilterChange} testid={`${testid}-status`} />
    <PricesFilter value={value?.prices} onChange={onPricesFilterChange} testid={`${testid}-prices`} />
    <CollectionsFilter
      value={value}
      onChange={onCollectionsFilterChange}
      onAttributesChange={onCollectionAttributesFilterChange}
      onAttributeCountsChange={onCollectionAttributeCountsFilterChange}
      testid={`${testid}-collections`}
      featuredTokens={featuredTokens}
      tokens={tokens}
      collections={collections}
      isFetchingTokens={isFetchingTokens}
      featuredTokensForAttributeCounts={featuredTokensForAttributeCounts}
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
