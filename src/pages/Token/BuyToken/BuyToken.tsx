import React, { FC, useCallback, useMemo } from 'react';
import { Button, Text } from 'components/UI';
import styled from 'styled-components';
import { BN } from '@polkadot/util';

import { useFee } from '../../../hooks/useFee';
import { Price } from '../TokenDetail/Price';
import { Grey300 } from '../../../styles/colors';
import { Offer } from '../../../api/restApi/offers/types';
import { useAccounts } from '../../../hooks/useAccounts';
import BuyBundleInformation from '../TokenDetail/BuyBundleInformation';

interface BuyTokenProps {
  offer?: Offer;
  onBuy(): void
  testid?: string
}

export const BuyToken: FC<BuyTokenProps> = ({ offer, onBuy, testid }) => {
  const { marketCommission } = useFee();
  const { selectedAccount } = useAccounts();

  const isEnoughBalance = useMemo(() => {
    if (!selectedAccount?.balance?.raw || selectedAccount.balance.raw.isZero() || !offer?.priceRaw) return false;
    return selectedAccount.balance.raw.gte(new BN(offer.priceRaw).add(new BN(marketCommission)));
  }, [offer?.priceRaw, selectedAccount?.balance?.raw, marketCommission]);

  const onBuyClick = useCallback(() => {
    if (!isEnoughBalance) return;

    onBuy();
  }, [onBuy, isEnoughBalance]);

  if (!offer) return null;

  return (<>
    <Text size={'l'}>Price</Text>
    <Price price={offer.priceRaw} />
    <ButtonWrapper>
      <Button
        onClick={onBuyClick}
        role='primary'
        title='Buy'
        wide={true}
        disabled={!isEnoughBalance}
      />
    </ButtonWrapper>
    {!isEnoughBalance && <Text color={'coral-500'} testid={`${testid}-low-balance-warning`}>Your balance is too low to buy</Text>}
    {offer.tokenDescription.nestingChildTokens?.length && <BuyBundleInformation testid={testid}/>}
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
