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
  
  const shouldUseUsdtPrice = selectedCurrencies.length === 0 || selectedCurrencies.length > 1;
  
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
    
    // Auto-apply filter when currencies change
    if (minPriceValue || maxPriceValue) {
      const willUseUsdtPrice = newSelection.length === 0 || newSelection.length > 1;
      
      if (willUseUsdtPrice) {
        onChange({
          minUsdtPrice: minPriceValue,
          maxUsdtPrice: maxPriceValue
        });
      } else {
        onChange({
          minPrice: minPriceValue,
          maxPrice: maxPriceValue
        });
      }
    }
    
    setTimeout(() => {
      isInternalChangeRef.current = false;
    }, 0);
  }, [localSelectedCurrencies, onCurrenciesChange, minPriceValue, maxPriceValue, onChange]);

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

      // Use USDT prices when multiple currencies or no currencies selected
      if (shouldUseUsdtPrice) {
        onChange({
          minUsdtPrice: minPrice,
          maxUsdtPrice: maxPrice
        });
      } else {
        onChange({
          minPrice,
          maxPrice
        });
      }
      return;
    }
    onChange(undefined);
  }, [minPriceValue, maxPriceValue, onChange, shouldUseUsdtPrice]);

  // Sync local state with props for prices
  useEffect(() => {
    if (shouldUseUsdtPrice) {
      setMinPriceValue(value?.minUsdtPrice);
      setMaxPriceValue(value?.maxUsdtPrice);
    } else {
      setMinPriceValue(value?.minPrice);
      setMaxPriceValue(value?.maxPrice);
    }
  }, [value?.minPrice, value?.maxPrice, value?.minUsdtPrice, value?.maxUsdtPrice, shouldUseUsdtPrice]);

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

  const hasActiveFilters = 
    !!(value?.minPrice || value?.maxPrice || value?.minUsdtPrice || value?.maxUsdtPrice) || 
    localSelectedCurrencies.length > 0;

  // Determine placeholder text based on currency selection
  const currencyLabel = shouldUseUsdtPrice ? 'USDT' : 'Selected Currency';
  const minPlaceholder = `Min (${shouldUseUsdtPrice ? 'USDT' : 'USD'})`;
  const maxPlaceholder = `Max (${shouldUseUsdtPrice ? 'USDT' : 'USD'})`;

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
