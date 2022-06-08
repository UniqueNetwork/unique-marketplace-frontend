import React, { FC } from 'react';
import styled from 'styled-components/macro';
import { Button, Text } from '@unique-nft/ui-kit';

import { AdditionalWarning100, AdditionalWarning500, Grey300 } from '../../../styles/colors';
import { Offer } from '../../../api/restApi/offers/types';
import { Price } from '../TokenDetail/Price';
import { useAccounts } from '../../../hooks/useAccounts';
import { useApi } from '../../../hooks/useApi';

interface SellTokenProps {
  offer?: Offer
  onSellClick(): void
  onTransferClick(): void
  onDelistClick(): void
}

export const SellToken: FC<SellTokenProps> = ({ offer, onSellClick, onTransferClick, onDelistClick }) => {
  const { selectedAccount } = useAccounts();
  const { settings } = useApi();
  if (offer) {
    return (<>
      <Text size={'l'}>{'Price'}</Text>
      <Price price={offer.price} />
      <ButtonWrapper>
        <Button title={'Delist'} role={'danger'} onClick={onDelistClick} />
      </ButtonWrapper>
      <Divider />
    </>);
  }

  return (
    <>
      <ActionsWrapper>
        {settings?.marketType !== 'primary' && <Button title={'Sell'} role={'primary'} onClick={onSellClick}/>}
        <Button title={'Transfer'} onClick={onTransferClick} />
      </ActionsWrapper>
      {(settings?.marketType !== 'primary' && !selectedAccount?.isOnWhiteList) && <WarningWrapper>
        A fee of ~0,001 KSM may be applied to the first sale transaction. Your address will be added to the transaction sponsoring whitelist allowing you to make feeless transactions.
      </WarningWrapper>}
      <Divider />
    </>
  );
};

const ActionsWrapper = styled.div`
  display: flex;
  column-gap: var(--gap);
`;

const WarningWrapper = styled.div`
  background: ${AdditionalWarning100};
  color: ${AdditionalWarning500};
  border-radius: 4px;
  padding: calc(var(--gap) / 2) var(--gap);
  margin-top: var(--gap);
  max-width: 704px;
`;

const ButtonWrapper = styled.div`
  width: 200px;
  margin-top: calc(var(--gap) * 1.5);
`;

const Divider = styled.div`
  margin: calc(var(--gap) * 1.5) 0;
  border-top: 1px dashed ${Grey300};
`;
