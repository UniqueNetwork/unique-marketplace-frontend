import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';
import { PriceRange } from './types';
import Accordion from '../Accordion/Accordion';
import { NumberInput } from '../NumberInput/NumberInput';

interface PricesFilterProps {
  value: PriceRange | undefined
  onChange(value: PriceRange | undefined): void
}

const PricesFilter: FC<PricesFilterProps> = ({ value, onChange }) => {
  const { minPrice, maxPrice } = value || {};
  const [minPriceValue, setMinPriceValue] = useState<string>();
  const [maxPriceValue, setMaxPriceValue] = useState<string>();

  const onApply = useCallback(() => {
    if (minPriceValue || maxPriceValue) {
      const priceRange = {
        minPrice: minPriceValue,
        maxPrice: maxPriceValue
      };
      onChange(priceRange);
      return;
    }
    onChange(undefined);
  }, [minPriceValue, maxPriceValue, onChange]);

  useEffect(() => {
    setMinPriceValue(minPrice);
    setMaxPriceValue(maxPrice);
  }, [minPrice, maxPrice]);

  const onChangeMinPrice = useCallback((value: string) => {
    setMinPriceValue(value || undefined);
  }, []);

  const onChangeMaxPrice = useCallback((value: string) => {
    setMaxPriceValue(value || undefined);
  }, []);

  const onPricesClear = useCallback(() => {
    setMinPriceValue(undefined);
    setMaxPriceValue(undefined);
    onChange(undefined);
  }, [onChange]);

  return (
    <Accordion title={'Price'}
      isOpen={true}
      onClear={onPricesClear}
      isClearShow={!!minPrice || !!maxPrice}
    >
      <PriceFilterWrapper>
        <PricesRangeWrapper>
          <NumberInput value={minPriceValue?.toString()} onChange={onChangeMinPrice} placeholder={'Min'} />
          <Text>to</Text>
          <NumberInput value={maxPriceValue?.toString()} onChange={onChangeMaxPrice} placeholder={'Max'} />
        </PricesRangeWrapper>
        <Button title={'Apply'} onClick={onApply}/>
      </PriceFilterWrapper>
    </Accordion>
  );
};

const PriceFilterWrapper = styled.div`
  padding-top: var(--gap);
  display: flex;
  flex-direction: column;
  row-gap: var(--gap);
  button {
    width: 71px;
  }
`;

const PricesRangeWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
  align-items: center;
`;

export default PricesFilter;
