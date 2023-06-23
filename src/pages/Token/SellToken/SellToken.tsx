import React, { FC, useMemo } from 'react';
import styled from 'styled-components';
import { Button, Text } from 'components/UI';

import { Grey300 } from 'styles/colors';
import { Offer } from 'api/restApi/offers/types';
import { Price } from '../TokenDetail/Price';
import { useAccounts } from 'hooks/useAccounts';
import { useApi } from 'hooks/useApi';
import { RoyaltyValue } from '../TokenDetail/Royalty';

interface SellTokenProps {
  offer?: Offer
  royalty?: number;
  isAllowed?: boolean
  onSellClick(): void
  onTransferClick(): void
  onDelistClick(): void
  testid: string
}

export const SellToken: FC<SellTokenProps> = ({ offer, royalty, isAllowed, onSellClick, onTransferClick, onDelistClick, testid }) => {
  const { selectedAccount } = useAccounts();
  const { settings } = useApi();

  const hideSellBtn = useMemo(() => {
    return false;
  }, [settings, selectedAccount]);

  if (offer) {
    return (<>
      <Text size={'l'}>{'Price'}</Text>
      <Price testid={testid} price={offer.price.parsed.toString()} />
      <RoyaltyValue value={royalty} />
      <ButtonWrapper>
        <Button
          title={'Delist'}
          role={'danger'}
          onClick={onDelistClick}
          testid={`${testid}-delist-button`}
        />
      </ButtonWrapper>
      <Divider />
    </>);
  }

  if (!isAllowed) return null;

  return (
    <>
      <RoyaltyValue value={royalty} />
      <ActionsWrapper>
        {!hideSellBtn && <Button
          title={'Sell'}
          role={'primary'}
          onClick={onSellClick}
          testid={`${testid}-sell-button`}
          disabled={(royalty || 0) >= 1}
        />}
        <Button
          title={'Transfer'}
          onClick={onTransferClick}
          testid={`${testid}-transfer-button`}
        />
      </ActionsWrapper>
      {(royalty || 0) >= 1 && <Text color={'coral-500'} testid={`${testid}-low-balance-warning`}>The royalty is too big. Maximum royalty - 99%</Text>}
      <Divider />
    </>
  );
};

const ActionsWrapper = styled.div`
  display: flex;
  column-gap: var(--gap);
  margin-bottom: calc(var(--gap) / 2);
`;

const ButtonWrapper = styled.div`
  width: 200px;
`;

const Divider = styled.div`
  margin: calc(var(--gap) * 1.5) 0;
  border-top: 1px dashed ${Grey300};
`;
