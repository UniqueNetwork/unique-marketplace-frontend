import React, { FCC, useCallback } from 'react';
import styled from 'styled-components';

import PricesFilter from 'components/Filters/PricesFilter';
import { AttributeItem, PriceRange, MyTokensFilterState, MyTokensStatuses, FilterChangeHandler } from './types';
import StatusFilter from './StatusFilter';
import CollectionsFilter from './CollectionsFilter';
import { MixedMyTokenAndOffer } from '../types';
import { TypeOfAssets, TypeOfCustomizableNFTs } from 'components/Filters/types';
import TypeOfAssetsFilter from 'components/Filters/TypeOfAssets';
import TypeOfCustomizablesFilter from 'components/Filters/TypeOfCustomizables';
import { GQLCollection } from 'api/scanApi/types';

type FilterProps = {
  value: MyTokensFilterState | null
  onFilterChange: FilterChangeHandler<MyTokensFilterState>
  tokens: MixedMyTokenAndOffer[]
  featuredTokens: MixedMyTokenAndOffer[]
  collections: GQLCollection[]
  isFetchingTokens: boolean
  testid: string
  featuredTokensForAttributeCounts: MixedMyTokenAndOffer[]
}

export const Filters: FCC<FilterProps> = ({ value, onFilterChange, featuredTokens, collections, isFetchingTokens, testid, tokens, featuredTokensForAttributeCounts }) => {
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

  const onTypeOfAssetsFilterChange = useCallback((typeOfAssets: TypeOfAssets) => {
    onFilterChange({ ...(value || {}), typeOfAssets });
  }, [value, onFilterChange]);

  const onTypeOfCustomizableChange = useCallback((typeOfCustomizableNFTs: TypeOfCustomizableNFTs) => {
    onFilterChange({ ...(value || {}), typeOfCustomizableNFTs });
  }, [value, onFilterChange]);

  return <FiltersStyled>
    <StatusFilter value={value?.statuses} onChange={onStatusFilterChange} testid={`${testid}-status`} />
    <TypeOfAssetsFilter
      isFetchingTokens={isFetchingTokens}
      value={value?.typeOfAssets}
      onChange={onTypeOfAssetsFilterChange}
      testid={`${testid}-assets`}
    />
    <TypeOfCustomizablesFilter
      isFetchingTokens={isFetchingTokens}
      value={value?.typeOfCustomizableNFTs}
      onChange={onTypeOfCustomizableChange}
      testid={`${testid}-customizable`}
    />
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
  row-gap: calc(var(--prop-gap) * 2);
  @media (max-width: 1024px) {
    width: 100%;
  }
`;
