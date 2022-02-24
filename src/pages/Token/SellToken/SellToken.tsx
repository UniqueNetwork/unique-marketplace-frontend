import React, { FC, useCallback } from 'react';
import { NFTToken } from '../../../api/chainApi/unique/types';
import { useOffer } from '../../../api/restApi/offers/offer';
import styled from 'styled-components/macro';
import { Button, Heading } from '@unique-nft/ui-kit';
import { AdditionalColorLight, AdditionalWarning100, AdditionalWarning500, Grey300 } from '../../../styles/colors';
import { Icon } from '../../../components/Icon/Icon';
import logoKusama from '../../../static/icons/logo-kusama.svg';
import { useFee } from '../../../hooks/useFee';
import { Price } from '../TokenDetail/Price';

interface ForOwnerProps {
  token: NFTToken
}

export const SellToken: FC<ForOwnerProps> = ({ token }) => {
  const { fee } = useFee();
  const { offer } = useOffer(token.collectionId || 0, token.id);

  const onSellClick = useCallback(() => {
    // TODO: open sell modal
  }, []);

  const onTransferClick = useCallback(() => {
    // TODO: open transfer modal
  }, []);

  const onDelistClick = useCallback(() => {
    // TODO: open transfer modal
  }, []);

  if (offer) {
 return (<>
   <Price price={offer.price} fee={fee} bid={offer.auction?.priceStep} />
   <ButtonWrapper>
     <Button title={'Delist'} role={'danger'} onClick={onDelistClick} />
   </ButtonWrapper>
 </>);
}

  return (
    <>
      <ActionsWrapper>
        <Button title={'Sell'} role={'primary'} onClick={onSellClick}/>
        <Button title={'Transfer'} onClick={onTransferClick} />
      </ActionsWrapper>
      <WarningWrapper>
        A fee of ~0,001 KSM may be applied to the first sale transaction. Your address will be added to the transaction sponsoring whitelist allowing you to make feeless transactions.
      </WarningWrapper>
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
`;

const ButtonWrapper = styled.div`
  width: 200px;
  margin-top: 24px;
`;

const Divider = styled.div`
  margin: 24px 0;
  border-top: 1px dashed ${Grey300};
`;
