import React, { FC, useMemo } from 'react';
import styled from 'styled-components';
import { Button, Text } from 'components/UI';

import { Grey300 } from 'styles/colors';
import { Offer } from 'api/restApi/offers/types';
import { Price } from '../TokenDetail/Price';
import { useApi } from 'hooks/useApi';
import { RoyaltyValue } from '../TokenDetail/Royalty';
import { blockedSellingCollections, blockedTransferringCollections } from './constants';

interface SellTokenProps {
  collectionId?: number;
  offer?: Offer
  royalty?: number;
  isAllowed?: boolean;
  isRFT: boolean;
  onSellClick(): void
  onTransferClick(): void
  onDelistClick(): void
  onChangePriceClick(): void
  testid: string
}

export const SellToken: FC<SellTokenProps> = ({
  offer,
  collectionId,
  royalty,
  isAllowed,
  isRFT,
  onSellClick,
  onTransferClick,
  onDelistClick,
  onChangePriceClick,
  testid
}) => {
  const { currentChainId, api } = useApi();

  const [hideSellBtn, hideTransferBtn] = useMemo(() => {
    if (!currentChainId || !collectionId) return [false, false];

    return [
      blockedSellingCollections[currentChainId]?.includes(collectionId) || isRFT,
      blockedTransferringCollections[currentChainId]?.includes(collectionId)
    ];
  }, [currentChainId, collectionId, isRFT]);

  const canChangePrice = useMemo(() => {
    if (!offer?.contractAddress) return false;
    return api?.market?.hasContractMethod(offer.contractAddress, 'changePrice');
  }, [offer, api]);

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
        {canChangePrice && <Button
          title={'Change price'}
          onClick={onChangePriceClick}
          testid={`${testid}-delist-button`}
        />}
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
        {!hideTransferBtn && <Button
          title={'Transfer'}
          onClick={onTransferClick}
          testid={`${testid}-transfer-button`}
        />}
      </ActionsWrapper>
      {(royalty || 0) >= 1 && <Text color={'coral-500'} testid={`${testid}-low-balance-warning`}>The royalty is too big. Maximum royalty - 99%</Text>}
      {(!hideSellBtn || !hideTransferBtn) && <Divider />}
    </>
  );
};

const ActionsWrapper = styled.div`
  display: flex;
  column-gap: var(--gap);
  margin-top: calc(var(--gap) / 2);
  margin-bottom: calc(var(--gap) / 2);
`;

const ButtonWrapper = styled.div`
  width: 200px;
  margin-top: calc(var(--gap) / 2);
  display: flex;
  gap: var(--gap);
`;

const Divider = styled.div`
  margin: calc(var(--gap) * 1.5) 0;
  border-top: 1px dashed ${Grey300};
`;
