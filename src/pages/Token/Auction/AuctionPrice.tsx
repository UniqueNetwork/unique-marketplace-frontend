import React, { FC } from 'react';
import { Heading, Icon, Text } from '@unique-nft/ui-kit';
import BN from 'bn.js';
import styled from 'styled-components/macro';

import Kusama from '../../../static/icons/logo-kusama.svg';
import { formatKusamaBalance } from '../../../utils/textUtils';
import { useApi } from '../../../hooks/useApi';

interface PriceProps {
  price: string
  step?: string
  bid?: string
  startPrice?: string
}

const tokenSymbol = 'KSM';

export const AuctionPrice: FC<PriceProps> = ({ price, startPrice, step, bid }) => {
  const { api } = useApi();

  return (
    <PriceWrapper>
      <Row>
        <Icon file={Kusama} size={32}/>
        <Heading size={'1'}>{`${formatKusamaBalance(new BN(price).toString(), api?.market?.kusamaDecimals)}`}</Heading>
      </Row>
      <Row>
        <Text color='grey-500' size='m'>
          {`${bid ? `Current bid: ${formatKusamaBalance(bid, api?.market?.kusamaDecimals)}` : `Starting price: ${formatKusamaBalance(startPrice || '0')}`} ${tokenSymbol}`}
        </Text>
      </Row>
      <Row>
        <Text color='grey-500' size='m'>
          {`Minimum step: ${formatKusamaBalance(step || '0')} ${tokenSymbol}`}
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
