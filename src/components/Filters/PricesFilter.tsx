import React, { FC, useCallback, useEffect, useState } from 'react';
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

  const handleCurrencyToggle = useCallback((currencyId: number) => {
    setLocalSelectedCurrencies((prev) => {
      const newSelection = prev.includes(currencyId)
        ? prev.filter((id) => id !== currencyId)
        : [...prev, currencyId];
      
      if (onCurrenciesChange) {
        onCurrenciesChange(newSelection);
      }
      return newSelection;
    });
  }, [onCurrenciesChange]);

  const onApply = useCallback(() => {
    if (minPriceValue || maxPriceValue) {
      let minPrice = minPriceValue;
      let maxPrice = maxPriceValue;

      if (minPriceValue && maxPriceValue && Number(maxPriceValue) < Number(minPriceValue)) {
        setMinPriceValue('0');
        minPrice = '0';
      }

      if (maxPriceValue && Number(maxPriceValue) === 0) {
        setMaxPriceValue('');
        maxPrice = undefined;
      }

      onChange({ minPrice, maxPrice });
      return;
    }
    onChange(undefined);
  }, [minPriceValue, maxPriceValue, onChange]);

  useEffect(() => {
    setMinPriceValue(minPrice);
    setMaxPriceValue(maxPrice);
  }, [minPrice, maxPrice]);

  useEffect(() => {
    const arraysAreEqual = 
      selectedCurrencies.length === localSelectedCurrencies.length &&
      selectedCurrencies.every(id => localSelectedCurrencies.includes(id));
    
    if (!arraysAreEqual) {
      setLocalSelectedCurrencies(selectedCurrencies);
    }
  }, [selectedCurrencies, localSelectedCurrencies]);

  const onChangeMinPrice = useCallback((value: string) => {
    setMinPriceValue(value || undefined);
  }, []);

  const onChangeMaxPrice = useCallback((value: string) => {
    setMaxPriceValue(value || undefined);
  }, []);

  const onPricesClear = useCallback(() => {
    setMinPriceValue(undefined);
    setMaxPriceValue(undefined);
    setLocalSelectedCurrencies([]);
    onChange(undefined);
    if (onCurrenciesChange) {
      onCurrenciesChange([]);
    }
  }, [onChange, onCurrenciesChange]);

  const onClearMinPrice = useCallback(() => {
    if (maxPriceValue !== undefined) return;
    onChange(undefined);
  }, [onChange, maxPriceValue]);

  const onClearMaxPrice = useCallback(() => {
    if (minPriceValue !== undefined) return;
    onChange(undefined);
  }, [onChange, minPriceValue]);

  return (
    <Accordion 
      title={'Price'}
      isOpen={true}
      onClear={onPricesClear}
      isClearShow={!!minPrice || !!maxPrice || localSelectedCurrencies.length > 0}
      children={
        <PriceFilterWrapper>
          {/* Currency checkboxes section */}
          {onCurrenciesChange && currencies.length > 0 && (
            <CurrenciesSection>
              <SectionLabel>Currency</SectionLabel>
              <CurrenciesWrapper>
                {currencies.map((currency) => (
                  <CurrencyItemWrapper key={currency.id} style={{ alignItems: 'center' }}>
                    <CurrencyItem>
                      <CheckboxWrapper>
                        <Checkbox
                          checked={localSelectedCurrencies.includes(Number(currency.id))}
                          onChange={() => handleCurrencyToggle(Number(currency.id))}
                          label={''}
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
              placeholder={'Min'}
              testid={`${testid}-minPrice`}
              disabled={disabled}
              onClear={onClearMinPrice}
            />
            <Text>to</Text>
            <NumberInput
              value={maxPriceValue?.toString()}
              onChange={onChangeMaxPrice}
              placeholder={'Max'}
              testid={`${testid}-maxPrice`}
              disabled={disabled}
              onClear={onClearMaxPrice}
            />
          </PricesRangeWrapper>
          <Button
            wide
            title={'Apply'}
            onClick={onApply}
            testid={`${testid}-apply-button`}
            disabled={disabled || (!minPriceValue && !maxPriceValue)}
          />
        </PriceFilterWrapper>
      }
    />
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
  align-items: center !important;
  column-gap: 8px;
  cursor: pointer;
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
