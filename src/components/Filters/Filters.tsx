import React, { FC, useCallback } from 'react';
import styled from 'styled-components';

import StatusFilter from './StatusFilter';
import PricesFilter from './PricesFilter';
import { AttributeItem, FiltersProps, PriceRange, Statuses, TypeOfAssets, TypeOfCustomizableNFTs, FilterState } from './types';
import CollectionsFilter from './CollectionsFilter';
import { useAccounts } from '../../hooks/useAccounts';
import TypeOfAssetsFilter from './TypeOfAssets';
import TypeOfCustomizablesFilter from './TypeOfCustomizables';

const updateFilterState = <K extends keyof FilterState>(
  currentState: FilterState | null | undefined,
  key: K,
  newValue: FilterState[K]
): FilterState | null => {
  const newState = { ...(currentState || {}) } as FilterState;
  
  const isEmpty = 
    newValue === undefined ||
    newValue === null ||
    (Array.isArray(newValue) && newValue.length === 0) ||
    (typeof newValue === 'object' && !Array.isArray(newValue) && Object.keys(newValue).length === 0);
  
  if (isEmpty) {
    delete newState[key];
  } else {
    newState[key] = newValue;
  }
  
  return Object.keys(newState).length > 0 ? newState : null;
};

export const Filters: FC<FiltersProps> = ({ value, attributes, attributeCounts, onFilterChange, testid }) => {
  const { selectedAccount } = useAccounts();

  const onStatusFilterChange = useCallback((statuses: Statuses) => {
    onFilterChange({ ...value, statuses });
  }, [value, onFilterChange]);

  const onPricesFilterChange = useCallback((prices: PriceRange | undefined) => {
    // Always replace the entire prices object, don't merge
    if (!prices || Object.keys(prices).length === 0) {
      // Remove prices completely
      const { prices: _, ...rest } = value || {};
      onFilterChange(Object.keys(rest).length > 0 ? rest as FilterState : null);
    } else {
      // Replace with new prices
      onFilterChange({ ...value, prices });
    }
  }, [value, onFilterChange]);

  const onCurrenciesFilterChange = useCallback((currencies: number[]) => {
    const newState = updateFilterState(value, 'currencies', currencies);
    onFilterChange(newState);
  }, [value, onFilterChange]);

  const onCollectionsFilterChange = useCallback((collections: number[]) => {
    onFilterChange({ ...value, collections, attributes: [], attributeCounts: [] });
  }, [value, onFilterChange]);

  const onCollectionAttributesFilterChange = useCallback((attributes: AttributeItem[]) => {
    const newState = updateFilterState(value, 'attributes', attributes);
    onFilterChange(newState);
  }, [value, onFilterChange]);

  const onCollectionAttributeCountsFilterChange = useCallback((attributeCounts: number[]) => {
    const newState = updateFilterState(value, 'attributeCounts', attributeCounts);
    onFilterChange(newState);
  }, [value, onFilterChange]);

  const onTypeOfAssetsFilterChange = useCallback((typeOfAssets: TypeOfAssets) => {
    const newState = updateFilterState(value, 'typeOfAssets', typeOfAssets);
    onFilterChange(newState);
  }, [value, onFilterChange]);

  const onTypeOfCustomizableChange = useCallback((typeOfCustomizableNFTs: TypeOfCustomizableNFTs) => {
    const newState = updateFilterState(value, 'typeOfCustomizableNFTs', typeOfCustomizableNFTs);
    onFilterChange(newState);
  }, [value, onFilterChange]);

  return (
    <FiltersStyled>
      <StatusFilter 
        value={value?.statuses} 
        onChange={onStatusFilterChange} 
        testid={`${testid}-status`} 
      />
      <TypeOfAssetsFilter
        isFetchingTokens={false}
        value={value?.typeOfAssets}
        onChange={onTypeOfAssetsFilterChange}
        testid={`${testid}-assets`}
      />
      <PricesFilter 
        value={value?.prices} 
        onChange={onPricesFilterChange}
        selectedCurrencies={value?.currencies}
        onCurrenciesChange={onCurrenciesFilterChange}
        testid={`${testid}-prices`} 
      />
      <CollectionsFilter
        value={value}
        attributes={attributes}
        attributeCounts={attributeCounts}
        onChange={onCollectionsFilterChange}
        onAttributesChange={onCollectionAttributesFilterChange}
        onAttributeCountsChange={onCollectionAttributeCountsFilterChange}
        testid={`${testid}-collections`}
      />
    </FiltersStyled>
  );
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