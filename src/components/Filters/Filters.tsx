import React, { FC, useCallback } from 'react';
import styled from 'styled-components';

import StatusFilter from './StatusFilter';
import PricesFilter from './PricesFilter';
import { AttributeItem, FiltersProps, PriceRange, Statuses, TypeOfAssets, TypeOfCustomizableNFTs } from './types';
import CollectionsFilter from './CollectionsFilter';
import { useAccounts } from '../../hooks/useAccounts';
import TypeOfAssetsFilter from './TypeOfAssets';
import TypeOfCustomizablesFilter from './TypeOfCustomizables';

export const Filters: FC<FiltersProps> = ({ value, attributes, attributeCounts, onFilterChange, testid }) => {
  const { selectedAccount } = useAccounts();

  const onStatusFilterChange = useCallback((statuses: Statuses) => {
    onFilterChange({ ...value, statuses });
  }, [value, onFilterChange, selectedAccount]);

  const onPricesFilterChange = useCallback((prices: PriceRange | undefined) => {
    onFilterChange({ ...value, prices });
  }, [value, onFilterChange]);

  const onCollectionsFilterChange = useCallback((collections: number[]) => {
    onFilterChange({ ...value, collections, attributes: [], attributeCounts: [] });
  }, [value, onFilterChange]);

  const onCollectionAttributesFilterChange = useCallback((attributes: AttributeItem[]) => {
    onFilterChange({ ...value, attributes });
  }, [value, onFilterChange]);

  const onCollectionAttributeCountsFilterChange = useCallback((attributeCounts: number[]) => {
    onFilterChange({ ...value, attributeCounts });
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
      isFetchingTokens={false}
      value={value?.typeOfAssets}
      onChange={onTypeOfAssetsFilterChange}
      testid={`${testid}-assets`}
    />
    <TypeOfCustomizablesFilter
      isFetchingTokens={false}
      value={value?.typeOfCustomizableNFTs}
      onChange={onTypeOfCustomizableChange}
      testid={`${testid}-customizable`}
    />
    <PricesFilter value={value?.prices} onChange={onPricesFilterChange} testid={`${testid}-prices`} />
    <CollectionsFilter
      value={value}
      attributes={attributes}
      attributeCounts={attributeCounts}
      onChange={onCollectionsFilterChange}
      onAttributesChange={onCollectionAttributesFilterChange}
      onAttributeCountsChange={onCollectionAttributeCountsFilterChange}
      testid={`${testid}-collections`}
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
