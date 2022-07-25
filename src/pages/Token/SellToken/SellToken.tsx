import React, { FC, useMemo } from 'react';
import styled from 'styled-components';
import { Button, Text } from '@unique-nft/ui-kit';

import { AdditionalWarning100, AdditionalWarning500, Grey300 } from 'styles/colors';
import { Offer } from 'api/restApi/offers/types';
import { Price } from '../TokenDetail/Price';
import { useAccounts } from 'hooks/useAccounts';
import { useApi } from 'hooks/useApi';

interface SellTokenProps {
  offer?: Offer
  isAllowed?: boolean
  onSellClick(): void
  onTransferClick(): void
  onDelistClick(): void
}

export const SellToken: FC<SellTokenProps> = ({ offer, isAllowed, onSellClick, onTransferClick, onDelistClick }) => {
  const { selectedAccount } = useAccounts();
  const { settings } = useApi();

  const hideSellBtn = useMemo(() => {
    return settings?.marketType === 'primary' && !settings?.administrators.includes(selectedAccount?.address || '');
  }, [settings, selectedAccount]);

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

  if (!isAllowed) return null;

  return (
    <>
      <ActionsWrapper>
        {!hideSellBtn && <Button title={'Sell'} role={'primary'} onClick={onSellClick}/>}
        <Button title={'Transfer'} onClick={onTransferClick} />
      </ActionsWrapper>
      <Divider />
    </>
  );
};

const ActionsWrapper = styled.div`
  display: flex;
  column-gap: var(--gap);
`;

const ButtonWrapper = styled.div`
  width: 200px;
  margin-top: calc(var(--gap) * 1.5);
`;

const Divider = styled.div`
  margin: calc(var(--gap) * 1.5) 0;
  border-top: 1px dashed ${Grey300};
`;
