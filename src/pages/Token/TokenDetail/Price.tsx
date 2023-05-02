import React, { FC } from 'react';
import { Heading } from '@unique-nft/ui-kit';
import BN from 'bn.js';
import styled from 'styled-components';
import { Icon } from 'components/UI/Icon/Icon';

import { formatKusamaBalance } from '../../../utils/textUtils';
import { useApi } from '../../../hooks/useApi';

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
        >{price}</Heading>
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
  column-gap: calc(var(--gap) / 2);
  && h1 {
    margin-bottom: 0;
  }
`;
