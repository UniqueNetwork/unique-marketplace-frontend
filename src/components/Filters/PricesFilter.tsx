import React, { FC, useCallback, useState } from 'react';
import { Button, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';
import { PriceRange } from './types';
import Accordion from '../Accordion/Accordion';
import { AmountInput } from '../AmountInput/AmountInput';

interface PricesFilterProps {
  onChange(value: PriceRange | undefined): void
}

const PricesFilter: FC<PricesFilterProps> = ({ onChange }) => {
  const [minPrice, setMinPrice] = useState<string>();
  const [maxPrice, setMaxPrice] = useState<string>();

  const onApply = useCallback(() => {
    if (minPrice && maxPrice) {
      const priceRange = {
        minPrice,
        maxPrice
      };
      onChange(priceRange);
      return;
    }
    onChange(undefined);
  }, [minPrice, maxPrice]);

  const onChangeMinPrice = useCallback((value: string) => {
    setMinPrice(value || undefined);
  }, []);

  const onChangeMaxPrice = useCallback((value: string) => {
    setMaxPrice(value || undefined);
  }, []);

  const onPricesClear = useCallback(() => {
    setMinPrice(undefined);
    setMaxPrice(undefined);
    onChange(undefined);
  }, []);

  return (
    <Accordion title={'Price'}
      isOpen={true}
      onClear={onPricesClear}
      isClearShow={!!minPrice && !!maxPrice}
    >
      <PriceFilterWrapper>
        <PricesRangeWrapper>
          <AmountInput value={minPrice?.toString()} onChange={onChangeMinPrice} placeholder={'Min'} />
          <Text>to</Text>
          <AmountInput value={maxPrice?.toString()} onChange={onChangeMaxPrice} placeholder={'Max'} />
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
