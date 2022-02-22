import React, { FC, useMemo } from 'react';
import styled from 'styled-components/macro';
import { Heading, Text } from '@unique-nft/ui-kit';

import ChainLogo from '../../../components/ChainLogo';
import { useApi } from '../../../hooks/useApi';

interface PriceProps {
  price: string;
  fee: number;
  bid?: string;
}

export const Price: FC<PriceProps> = ({ price, fee, bid }) => {
  const { chainData } = useApi();
  const tokenSymbol = useMemo(() => chainData?.properties.tokenSymbol || 'unavailable', [chainData]);

  return (
    <PriceWrapper>
      <Row>
        <ChainLogo />
        <Heading size={'1'}>{`${Number(price) + fee}`}</Heading>
      </Row>
      <Row>
        <Text color='grey-500' size='m'>
          {`${bid ? `Bid: ${bid}` : `Price: ${price}`} ${tokenSymbol}`}
        </Text>
      </Row>
      <Row>
        <Text color='grey-500' size='m'>
          {`Network fee: ${fee} ${tokenSymbol}`}
        </Text>
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
