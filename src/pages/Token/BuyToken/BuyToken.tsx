import React, { FC, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { Button, Text, Tooltip } from 'components/UI';
import styled from 'styled-components';
import { Price } from '../TokenDetail/Price';
import { Grey300 } from '../../../styles/colors';
import { Offer } from '../../../api/restApi/offers/types';
import { useAccounts } from '../../../hooks/useAccounts';
import { RoyaltyValue } from '../TokenDetail/Royalty';
import { ConnectWalletModalContext } from 'account/ConnectWalletModalContext';

interface BuyTokenProps {
  offer?: Offer;
  royalty?: number;
  onBuy(): void
  testid?: string
}

export const BuyToken: FC<BuyTokenProps> = ({ offer, royalty, onBuy, testid }) => {
  const { selectedAccount } = useAccounts();
  const { setIsOpenConnectWalletModal } = useContext(ConnectWalletModalContext);

  const onBuyClick = useCallback(() => {
    onBuy();
  }, [onBuy]);

  const onShowConnectAccountDialog = useCallback(() => {
    setIsOpenConnectWalletModal(true);
  }, []);

  const buyButtonRef = useRef<HTMLButtonElement>(null);

  if (!offer) return null;

  return (<>
    <Text size={'l'}>Price</Text>
    <Price price={offer?.price} />
    <RoyaltyValue value={royalty} />
    <ButtonWrapper>
      <Button
        onClick={selectedAccount ? onBuyClick : onShowConnectAccountDialog}
        role='primary'
        title='Buy'
        ref={buyButtonRef}
        wide={true}
        disabled={(royalty || 0) >= 1}
      />
    </ButtonWrapper>
    {(royalty || 0) >= 1 && <Text color={'coral-500'} testid={`${testid}-low-balance-warning`}>The royalty is too big. Maximum royalty - 99%</Text>}
    <Divider />
  </>);
};

const ButtonWrapper = styled.div`
  width: 200px;
  margin-top: calc(var(--prop-gap) / 2);
  margin-bottom: calc(var(--prop-gap) / 2);
`;

const Divider = styled.div`
  margin: calc(var(--prop-gap) * 1.5) 0;
  border-top: 1px dashed ${Grey300};
`;
