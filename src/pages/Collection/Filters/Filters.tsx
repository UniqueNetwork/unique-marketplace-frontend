import React, { FC, useCallback } from 'react';
import styled from 'styled-components';

import PricesFilter from 'components/Filters/PricesFilter';
import { FiltersProps, PriceRange } from './types';
import AttributesFilterSection from './AttributesFilterSection';
import { AttributeItem } from 'components/Filters/types';

export const Filters: FC<FiltersProps> = ({
  value,
  onFilterChange,
  testid,
  featuredTokens,
  tokens,
  featuredTokensForAttributeCounts,
  isFetchingTokens

}) => {
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
    <PricesFilter value={value?.prices} onChange={onPricesFilterChange} testid={`${testid}-prices`} />
    <AttributesFilterSection
      value={value}
      onChange={onCollectionsFilterChange}
      onAttributesChange={onCollectionAttributesFilterChange}
      onAttributeCountsChange={onCollectionAttributeCountsFilterChange}
      testid={`${testid}-collections`}
      featuredTokens={featuredTokens}
      tokens={tokens}
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
