import React, { FC, useCallback, useEffect, useState, useRef } from 'react';
import { Button, Text } from 'components/UI';
import styled from 'styled-components';
import { PriceRange } from './types';
import { Accordion } from '../Accordion/Accordion';
import { NumberInput } from '../NumberInput/NumberInput';
import { Checkbox } from 'components/UI/Checkbox/Checkbox2';
import { useApi } from 'hooks/useApi';

interface PricesFilterProps {
  value: PriceRange | undefined;
  onChange(value: PriceRange | undefined): void;
  selectedCurrencies?: number[];
  onCurrenciesChange?(currencies: number[]): void;
  testid: string;
  disabled?: boolean;
}

const PricesFilter: FC<PricesFilterProps> = ({ 
  value, 
  onChange, 
  selectedCurrencies = [],
  onCurrenciesChange,
  testid, 
  disabled 
}) => {
  const { currencies } = useApi();
  const { minPrice, maxPrice } = value || {};
  const [minPriceValue, setMinPriceValue] = useState<string>();
  const [maxPriceValue, setMaxPriceValue] = useState<string>();
  const [localSelectedCurrencies, setLocalSelectedCurrencies] = useState<number[]>(selectedCurrencies);
  
  // Track if we're updating from internal change (to avoid syncing back from props)
  const isInternalChangeRef = useRef(false);

  const handleCurrencyToggle = useCallback((currencyId: number) => {
    const newSelection = localSelectedCurrencies.includes(currencyId)
      ? localSelectedCurrencies.filter((id) => id !== currencyId)
      : [...localSelectedCurrencies, currencyId];
    
    isInternalChangeRef.current = true;
  
    setLocalSelectedCurrencies(newSelection);

    if (onCurrenciesChange) {
      onCurrenciesChange(newSelection);
    }
    
    setTimeout(() => {
      isInternalChangeRef.current = false;
    }, 0);
  }, [localSelectedCurrencies, onCurrenciesChange]);

  const onApply = useCallback(() => {
    if (minPriceValue || maxPriceValue) {
      let minPrice = minPriceValue;
      let maxPrice = maxPriceValue;

      // If max < min, reset min to 0
      if (minPriceValue && maxPriceValue && Number(maxPriceValue) < Number(minPriceValue)) {
        setMinPriceValue('0');
        minPrice = '0';
      }

      // If max equals 0, clear it
      if (maxPriceValue && Number(maxPriceValue) === 0) {
        setMaxPriceValue('');
        maxPrice = undefined;
      }

      onChange({ minPrice, maxPrice });
      return;
    }
    onChange(undefined);
  }, [minPriceValue, maxPriceValue, onChange]);

  // Sync local state with props for prices
  useEffect(() => {
    setMinPriceValue(minPrice);
    setMaxPriceValue(maxPrice);
  }, [minPrice, maxPrice]);

  useEffect(() => {

    if (isInternalChangeRef.current) {
      return;
    }
    
    // Create string representations for deep comparison
    const propsStr = JSON.stringify([...selectedCurrencies].sort());
    const localStr = JSON.stringify([...localSelectedCurrencies].sort());
    
    // Only update if actually different
    if (propsStr !== localStr) {
      setLocalSelectedCurrencies(selectedCurrencies);
    }
  }, [selectedCurrencies]);

  const onChangeMinPrice = useCallback((value: string) => {
    setMinPriceValue(value || undefined);
  }, []);

  const onChangeMaxPrice = useCallback((value: string) => {
    setMaxPriceValue(value || undefined);
  }, []);

  const onPricesClear = useCallback(() => {
    isInternalChangeRef.current = true;
    
    setMinPriceValue(undefined);
    setMaxPriceValue(undefined);
    setLocalSelectedCurrencies([]);
    
    // Call callbacks to remove filters from parent state
    onChange(undefined);
    if (onCurrenciesChange) {
      onCurrenciesChange([]);
    }
    
    // Reset flag after a tick
    setTimeout(() => {
      isInternalChangeRef.current = false;
    }, 0);
  }, [onChange, onCurrenciesChange]);

  const onClearMinPrice = useCallback(() => {
    if (maxPriceValue !== undefined) return;
    onChange(undefined);
  }, [onChange, maxPriceValue]);

  const onClearMaxPrice = useCallback(() => {
    if (minPriceValue !== undefined) return;
    onChange(undefined);
  }, [onChange, minPriceValue]);

  const hasActiveFilters = !!minPrice || !!maxPrice || localSelectedCurrencies.length > 0;

  return (
    <Accordion 
      title="Price"
      isOpen={true}
      onClear={onPricesClear}
      isClearShow={hasActiveFilters}
    >
      <PriceFilterWrapper>
        {/* Currency checkboxes section */}
        {onCurrenciesChange && currencies.length > 0 && (
          <CurrenciesSection>
            <SectionLabel>Currency</SectionLabel>
            <CurrenciesWrapper>
              {currencies.map((currency) => (
                <CurrencyItemWrapper key={currency.id}>
                  <CurrencyItem onClick={() => !disabled && handleCurrencyToggle(Number(currency.id))}>
                    <CheckboxWrapper>
                      <Checkbox
                        checked={localSelectedCurrencies.includes(Number(currency.id))}
                        onChange={() => handleCurrencyToggle(Number(currency.id))}
                        label=""
                        testid={`${testid}-currency-${currency.id}`}
                        disabled={disabled}
                      />
                    </CheckboxWrapper>
                    {currency.iconUrl && (
                      <CurrencyIcon src={currency.iconUrl} alt={currency.title} />
                    )}
                    <CurrencyLabel>{currency.title}</CurrencyLabel>
                  </CurrencyItem>
                </CurrencyItemWrapper>
              ))}
            </CurrenciesWrapper>
          </CurrenciesSection>
        )}

        {/* Price range section */}
        <PricesRangeWrapper>
          <NumberInput
            value={minPriceValue?.toString()}
            onChange={onChangeMinPrice}
            placeholder="Min"
            testid={`${testid}-minPrice`}
            disabled={disabled}
            onClear={onClearMinPrice}
          />
          <Text>to</Text>
          <NumberInput
            value={maxPriceValue?.toString()}
            onChange={onChangeMaxPrice}
            placeholder="Max"
            testid={`${testid}-maxPrice`}
            disabled={disabled}
            onClear={onClearMaxPrice}
          />
        </PricesRangeWrapper>
        
        <Button
          wide
          title="Apply"
          onClick={onApply}
          testid={`${testid}-apply-button`}
          disabled={disabled || (!minPriceValue && !maxPriceValue)}
        />
      </PriceFilterWrapper>
    </Accordion>
  );
};

const PriceFilterWrapper = styled.div`
  padding-top: var(--prop-gap);
  display: flex;
  flex-direction: column;
  row-gap: var(--prop-gap);
  button {
    width: 71px;
  }
`;

const CurrenciesSection = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 8px;
`;

const SectionLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
`;

const CurrenciesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 8px;
`;

const CurrencyItemWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const CurrencyItem = styled.div`
  display: flex;
  align-items: center;
  column-gap: 8px;
  cursor: pointer;
  user-select: none;
`;

const CurrencyIcon = styled.img`
  width: 20px;
  height: 20px;
  object-fit: contain;
`;

const CurrencyLabel = styled.span`
  font-size: 14px;
  line-height: 20px;
`;

const PricesRangeWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--prop-gap) / 2);
  align-items: center;
`;

const CheckboxWrapper = styled.div`
  width: 20px;
  height: 20px;
`;

export default PricesFilter;
