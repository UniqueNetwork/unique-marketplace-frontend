import React, { FC } from 'react';
import { Heading, Icon, Text } from '@unique-nft/ui-kit';
import BN from 'bn.js';
import styled from 'styled-components/macro';

import Kusama from '../../../static/icons/logo-kusama.svg';
import { formatKusamaBalance } from '../../../utils/textUtils';
import { useApi } from '../../../hooks/useApi';

interface PriceProps {
  price: string;
  minStep?: string;
  topBid?: string;
}

const tokenSymbol = 'KSM';

export const PriceForAuction: FC<PriceProps> = ({ price, minStep, topBid }) => {
  const { api } = useApi();

  const startPrice = price || minStep;

  return (
    <PriceWrapper>
      <Row>
        <Heading size={'1'}>{topBid
          ? `${formatKusamaBalance(new BN(Number(price) + Number(minStep)).toString(), api?.market?.kusamaDecimals)}`
          : `${formatKusamaBalance(new BN(Number(startPrice)).toString(), api?.market?.kusamaDecimals)}`
        }</Heading>
        <Icon file={Kusama} size={32} />
      </Row>
      {topBid && <Row>
        <Text color='grey-500' size='m'>
          {`Current bid: ${formatKusamaBalance(price)} ${tokenSymbol}`}
        </Text>
      </Row>}
      {topBid && minStep && <Row>
        <Text color='grey-500' size='m'>
          {`Minimum step: ${formatKusamaBalance(minStep)} ${tokenSymbol}`}
        </Text>
      </Row>}
    </PriceWrapper>
  );
};

const PriceWrapper = styled.div`
  > div:first-of-type {
    margin: 16px 0 8px;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  column-gap: calc(var(--gap) / 2);
  && h1 {
    margin-bottom: 0;
  }
`;
