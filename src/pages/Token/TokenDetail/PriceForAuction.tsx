import React, { FC } from 'react';
import BN from 'bn.js';
import styled from 'styled-components';

import { Heading, Text, Icon } from 'components/UI';
import { formatBalance } from '../../../utils/textUtils';
import { useApi } from '../../../hooks/useApi';

interface PriceProps {
  price: string;
  minStep?: string;
  topBid?: string;
  testid?: string
}

const tokenSymbol = '!!!OLDK_SM!!!';

export const PriceForAuction: FC<PriceProps> = ({ price, minStep, topBid, testid }) => {
  const { api } = useApi();

  const priceBN = new BN(price);
  const minStepBN = new BN(minStep || 0);

  const startPrice = !priceBN.isZero() ? priceBN : minStepBN;

  const decimals = api?.market?.decimals;

  return (
    <PriceWrapper>
      <Row>
        <Heading size={'1'} testid={`${testid}-value`}>{topBid
          ? `${formatBalance(priceBN.add(minStepBN).toString())}`
          : `${formatBalance(startPrice.toString())}`
        }</Heading>
        <Icon name={'chain-kusama'} size={32} />
      </Row>
      {topBid && <Row>
        <Text color='grey-500' size='m' testid={`${testid}-current-bid`}>
          {`Current bid: ${formatBalance(price)} ${tokenSymbol}`}
        </Text>
      </Row>}
      {topBid && minStep && <Row>
        <Text color='grey-500' size='m' testid={`${testid}-minimum-step`}>
          {`Minimum step: ${formatBalance(minStep)} ${tokenSymbol}`}
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
