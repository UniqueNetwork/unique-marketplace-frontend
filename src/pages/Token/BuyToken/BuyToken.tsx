import React, { FC, useCallback, useMemo } from 'react';
import { Button, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';
import { BN } from '@polkadot/util';

import { useFee } from '../../../hooks/useFee';
import { Price } from '../TokenDetail/Price';
import { Grey300 } from '../../../styles/colors';
import { Offer } from '../../../api/restApi/offers/types';
import { useAccounts } from '../../../hooks/useAccounts';

interface BuyTokenProps {
  offer?: Offer;
  onBuy(): void
}

export const BuyToken: FC<BuyTokenProps> = ({ offer, onBuy }) => {
  const { fee } = useFee();
  const { selectedAccount } = useAccounts();

  const isEnoughBalance = useMemo(() => {
    if (!selectedAccount?.balance?.KSM || selectedAccount.balance.KSM.isZero() || !offer?.price) return false;
    return selectedAccount.balance.KSM.gte(new BN(offer.price).add(new BN(fee)));
  }, [offer?.price, selectedAccount?.balance?.KSM]);

  const onBuyClick = useCallback(() => {
    if (!isEnoughBalance) return;

    onBuy();
  }, [onBuy, isEnoughBalance]);

  if (!offer) return null;

  return (<>
    <Text size={'l'}>Price</Text>
    <Price price={offer.price} />
    <ButtonWrapper>
      <Button
        onClick={onBuyClick}
        role='primary'
        title='Buy'
        wide={true}
        disabled={!isEnoughBalance}
      />
    </ButtonWrapper>
    {!isEnoughBalance && <Text color={'coral-500'}>Your balance is too low to buy</Text>}
    <Divider />
  </>);
};

const ButtonWrapper = styled.div`
  width: 200px;
  margin-top: calc(var(--gap) * 1.5);
`;

const Divider = styled.div`
  margin: calc(var(--gap) * 1.5) 0;
  border-top: 1px dashed ${Grey300};
`;
