import React, { FC } from 'react';
import styled from 'styled-components';

import { Icon, Heading } from 'components/UI';
import { useApi } from '../../../hooks/useApi';
import { formatBalance } from 'utils/textUtils';

interface PriceProps {
  price: string;
  testid?: string
}

export const Price: FC<PriceProps> = ({ price, testid = '' }) => {
  const { currentChainId } = useApi();
  return (
    <PriceWrapper>
      <Row>
        <Heading
          testid={`${testid}-price`}
          size={'1'}
        >{formatBalance(price)}</Heading>
        <Icon name={`chain-${currentChainId}`} size={32} />
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
