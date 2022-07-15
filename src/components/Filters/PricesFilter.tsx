import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { PriceRange } from './types';
import Accordion from '../Accordion/Accordion';
import { NumberInput } from '../NumberInput/NumberInput';

interface PricesFilterProps {
  value: PriceRange | undefined
  onChange(value: PriceRange | undefined): void
  testid: string
}

const PricesFilter: FC<PricesFilterProps> = ({ value, onChange, testid }) => {
  const { minPrice, maxPrice } = value || {};
  const [minPriceValue, setMinPriceValue] = useState<string>();
  const [maxPriceValue, setMaxPriceValue] = useState<string>();

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
      testid={`${testid}-accordion`}
    >
      <PriceFilterWrapper>
        <PricesRangeWrapper>
          <NumberInput
            value={minPriceValue?.toString()}
            onChange={onChangeMinPrice}
            placeholder={'Min'}
            testid={`${testid}-minPrice`}
          />
          <Text>to</Text>
          <NumberInput
            value={maxPriceValue?.toString()}
            onChange={onChangeMaxPrice}
            placeholder={'Max'}
            testid={`${testid}-maxPrice`}
          />
        </PricesRangeWrapper>
        <Button
          title={'Apply'}
          onClick={onApply}
          // @ts-ignore
          testid={`${testid}-apply-button`}
        />
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
