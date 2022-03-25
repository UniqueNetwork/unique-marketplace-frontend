import React, { FC } from 'react';
import { Heading, Icon, Text } from '@unique-nft/ui-kit';
import BN from 'bn.js';
import styled from 'styled-components/macro';

import Kusama from '../../../static/icons/logo-kusama.svg';
import { formatKusamaBalance } from '../../../utils/textUtils';
import { useApi } from '../../../hooks/useApi';

interface PriceProps {
  price: string;
}

export const Price: FC<PriceProps> = ({ price }) => {
  const { api } = useApi();

  return (
    <PriceWrapper>
      <Row>
        <Heading size={'1'}>{`${formatKusamaBalance(new BN(price).toString(), api?.market?.kusamaDecimals)}`}</Heading>
        <Icon file={Kusama} size={32}/>
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
