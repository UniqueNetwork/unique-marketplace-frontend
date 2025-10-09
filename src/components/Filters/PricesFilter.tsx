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
  
  // Determine if we should use USDT prices based on currency selection
  const shouldUseUsdtPrice = selectedCurrencies.length === 0 || selectedCurrencies.length > 1;
  
  // Get label text for filtering
  const filterLabel = !shouldUseUsdtPrice && selectedCurrencies.length === 1 
    ? currencies.find(c => Number(c.id) === selectedCurrencies[0])?.title || 'Currency'
    : 'USDT';
  
  // Store actual price values (independent of USD/USDT mode)
  const [minPriceValue, setMinPriceValue] = useState<string>();
  const [maxPriceValue, setMaxPriceValue] = useState<string>();
  const [localSelectedCurrencies, setLocalSelectedCurrencies] = useState<number[]>(selectedCurrencies);
  
  // Track if we're updating from internal change (to avoid syncing back from props)
  const isInternalChangeRef = useRef(false);
  const previousShouldUseUsdtPriceRef = useRef(shouldUseUsdtPrice);
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Simple throttle function using setTimeout
  const throttledAutoApply = useCallback((minVal: string | undefined, maxVal: string | undefined, useUsdt: boolean) => {
    // Clear existing timer
    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
    }

    // Set new timer
    throttleTimerRef.current = setTimeout(() => {
      if (!minVal && !maxVal) {
        onChange(undefined);
        return;
      }

      isInternalChangeRef.current = true;

      // Send ONLY the appropriate price parameters based on mode
      const newPrices: PriceRange = {};
      
      if (useUsdt) {
        if (minVal) newPrices.minUsdtPrice = minVal;
        if (maxVal) newPrices.maxUsdtPrice = maxVal;
      } else {
        if (minVal) newPrices.minPrice = minVal;
        if (maxVal) newPrices.maxPrice = maxVal;
      }
      
      onChange(newPrices);

      setTimeout(() => {
        isInternalChangeRef.current = false;
      }, 300);
    }, 250);
  }, [onChange]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
    };
  }, []);

  const handleCurrencyToggle = useCallback((currencyId: number) => {
    const newSelection = localSelectedCurrencies.includes(currencyId)
      ? localSelectedCurrencies.filter((id) => id !== currencyId)
      : [...localSelectedCurrencies, currencyId];
    
    isInternalChangeRef.current = true;
    setLocalSelectedCurrencies(newSelection);

    if (onCurrenciesChange) {
      onCurrenciesChange(newSelection);
    }
    
    // Reset flag after longer delay to ensure useEffect doesn't override
    setTimeout(() => {
      isInternalChangeRef.current = false;
    }, 300);
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

      isInternalChangeRef.current = true;

      // Send ONLY the appropriate price parameters based on mode
      const newPrices: PriceRange = {};
      
      if (shouldUseUsdtPrice) {
        // USDT mode: only set USDT prices
        if (minPrice) newPrices.minUsdtPrice = minPrice;
        if (maxPrice) newPrices.maxUsdtPrice = maxPrice;
      } else {
        // USD mode: only set regular prices
        if (minPrice) newPrices.minPrice = minPrice;
        if (maxPrice) newPrices.maxPrice = maxPrice;
      }
      
      onChange(newPrices);

      setTimeout(() => {
        isInternalChangeRef.current = false;
      }, 300);
      
      return;
    }
    onChange(undefined);
  }, [minPriceValue, maxPriceValue, onChange, shouldUseUsdtPrice]);

  // Sync local state with props for prices
  useEffect(() => {
    // Get the current mode
    const currentMode = shouldUseUsdtPrice;
    const previousMode = previousShouldUseUsdtPriceRef.current;
    
    // Mode changed (switching between USD and USDT) - ALWAYS clear inputs
    if (currentMode !== previousMode) {
      // CLEAR inputs when switching modes
      setMinPriceValue(undefined);
      setMaxPriceValue(undefined);
      
      // CLEAR old price parameters in parent state
      isInternalChangeRef.current = true;
      onChange(undefined);
      
      setTimeout(() => {
        isInternalChangeRef.current = false;
      }, 300);
      
      previousShouldUseUsdtPriceRef.current = currentMode;
      return;
    }

    // For normal sync - check internal flag
    if (isInternalChangeRef.current) {
      return;
    }
    
    // Normal sync: update from props if values changed externally
    if (currentMode) {
      // USDT mode: use minUsdtPrice/maxUsdtPrice
      if (value?.minUsdtPrice !== minPriceValue) {
        setMinPriceValue(value?.minUsdtPrice);
      }
      if (value?.maxUsdtPrice !== maxPriceValue) {
        setMaxPriceValue(value?.maxUsdtPrice);
      }
    } else {
      // USD mode: use minPrice/maxPrice
      if (value?.minPrice !== minPriceValue) {
        setMinPriceValue(value?.minPrice);
      }
      if (value?.maxPrice !== maxPriceValue) {
        setMaxPriceValue(value?.maxPrice);
      }
    }
    
    previousShouldUseUsdtPriceRef.current = currentMode;
  }, [value?.minPrice, value?.maxPrice, value?.minUsdtPrice, value?.maxUsdtPrice, shouldUseUsdtPrice, onChange]);

  useEffect(() => {
    if (isInternalChangeRef.current) {
      return;
    }
    
    setLocalSelectedCurrencies(selectedCurrencies);
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
    
    // Reset flag after longer delay
    setTimeout(() => {
      isInternalChangeRef.current = false;
    }, 300);
  }, [onChange, onCurrenciesChange]);

  const onClearMinPrice = useCallback(() => {
    if (maxPriceValue !== undefined) return;
    isInternalChangeRef.current = true;
    onChange(undefined);
    setTimeout(() => {
      isInternalChangeRef.current = false;
    }, 300);
  }, [onChange, maxPriceValue]);

  const onClearMaxPrice = useCallback(() => {
    if (minPriceValue !== undefined) return;
    isInternalChangeRef.current = true;
    onChange(undefined);
    setTimeout(() => {
      isInternalChangeRef.current = false;
    }, 300);
  }, [onChange, minPriceValue]);

  const hasActiveFilters = 
    !!(value?.minPrice || value?.maxPrice || value?.minUsdtPrice || value?.maxUsdtPrice) || 
    localSelectedCurrencies.length > 0;

  // Placeholders are simple since we have label above
  const minPlaceholder = 'Min';
  const maxPlaceholder = 'Max';

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
        <CurrencyLabelSection>
          <CurrencyLabelText>Filter by {filterLabel}:</CurrencyLabelText>
          
          
          <PricesRangeWrapper>
            <NumberInput
              value={minPriceValue?.toString()}
              onChange={onChangeMinPrice}
              placeholder={minPlaceholder}
              testid={`${testid}-minPrice`}
              disabled={disabled}
              onClear={onClearMinPrice}
            />
            <Text>to</Text>
            <NumberInput
              value={maxPriceValue?.toString()}
              onChange={onChangeMaxPrice}
              placeholder={maxPlaceholder}
              testid={`${testid}-maxPrice`}
              disabled={disabled}
              onClear={onClearMaxPrice}
            />
          </PricesRangeWrapper>
        </CurrencyLabelSection>
        
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

const CurrencyLabelSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  column-gap: 8px;
  padding: 4px 0;
`;

const CurrencyLabelText = styled.span`
  font-size: 14px;
  font-weight: 600;
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
