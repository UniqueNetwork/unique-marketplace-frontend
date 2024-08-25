import React, { FCC, useMemo } from 'react';
import styled from 'styled-components';

import { Icon, Heading } from 'components/UI';
import { useApi } from '../../../hooks/useApi';
import { formatBalance } from 'utils/textUtils';
import { OfferPrice } from 'api/restApi/offers/types';

interface PriceProps {
  price: OfferPrice
  testid?: string
}

export const Price: FCC<PriceProps> = ({ price, testid = '' }) => {
  const { currentChainId, currencyMap } = useApi();
  const currentCurrency = useMemo(
    () => currencyMap.get(String(price.currency)),
    [currencyMap, price.currency]
  );

  return (
    <PriceWrapper>
      <Row>
        <Heading testid={`${testid}-price`} size={'1'}>
          {formatBalance(
            Number(price.raw) / 10 ** (currentCurrency?.decimals || 1)
          )}
        </Heading>
        {price.currency ? (
          <img width={32} height={32} src={currentCurrency?.iconUrl} />
        ) : (
          <Icon name={`chain-${currentChainId}`} size={32} />
        )}
      </Row>
    </PriceWrapper>
  );
};

const PriceWrapper = styled.div`
  
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  column-gap: calc(var(--prop-gap) / 2);
  && h1 {
    margin-bottom: 0;
  }
`;
