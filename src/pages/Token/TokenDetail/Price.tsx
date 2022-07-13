import React, { FC } from 'react';
import { Heading, Icon } from '@unique-nft/ui-kit';
import BN from 'bn.js';
import styled from 'styled-components';

import { formatKusamaBalance } from '../../../utils/textUtils';
import { useApi } from '../../../hooks/useApi';

interface PriceProps {
  price: string;
  testid?: string
}

export const Price: FC<PriceProps> = ({ price, testid = '' }) => {
  const { api } = useApi();

  return (
    <PriceWrapper>
      <Row>
        <Heading
          // @ts-ignore
          testid={`${testid}-price`}
          size={'1'}
        >{`${formatKusamaBalance(new BN(price).toString(), api?.market?.kusamaDecimals)}`}</Heading>
        <Icon name={'chain-kusama'} size={32} />
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
