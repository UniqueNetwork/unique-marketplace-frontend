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
  testid: string
}

export const SellToken: FC<SellTokenProps> = ({ offer, isAllowed, onSellClick, onTransferClick, onDelistClick, testid }) => {
  const { selectedAccount } = useAccounts();
  const { settings } = useApi();

  const hideSellBtn = useMemo(() => {
    return settings?.marketType === 'primary' && !settings?.administrators.includes(selectedAccount?.address || '');
  }, [settings, selectedAccount]);

  if (offer) {
    return (<>
      <Text size={'l'}>{'Price'}</Text>
      <Price testid={testid} price={offer.price} />
      <ButtonWrapper>
        <Button
          title={'Delist'}
          role={'danger'}
          onClick={onDelistClick}
          // @ts-ignore
          testid={`${testid}-delist-button`}
        />
      </ButtonWrapper>
      <Divider />
    </>);
  }

  if (!isAllowed) return null;

  return (
    <>
      <ActionsWrapper>
        {!hideSellBtn && <Button
          title={'Sell'}
          role={'primary'}
          onClick={onSellClick}
          // @ts-ignore
          testid={`${testid}-sell-button`}
        />}
        <Button
          title={'Transfer'}
          onClick={onTransferClick}
          // @ts-ignore
          testid={`${testid}-transfer-button`}
        />
      </ActionsWrapper>
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
