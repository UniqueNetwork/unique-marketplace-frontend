import React, { FC, useCallback } from 'react';
import { Button } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { useFee } from '../../../hooks/useFee';
import { NFTToken } from '../../../api/chainApi/unique/types';
import { Price } from '../TokenDetail/Price';
import Auction from '../Auction/Auction';
import { Grey300 } from '../../../styles/colors';
import { Offer } from '../../../api/restApi/offers/types';

interface BuyTokenProps {
  token: NFTToken;
  offer: Offer;
}

export const BuyToken: FC<BuyTokenProps> = ({ offer, token }) => {
  const { fee } = useFee();

  const onBuyButtonClick = useCallback(() => {
    console.log('buy click');
  }, []);

  if (!offer) return null;

  return (<>
    <Price price={offer.price} fee={fee} bid={offer.auction?.priceStep} />
    {offer.auction
? <Auction offer={offer} token={token} />
: <>
  <ButtonWrapper>
    <Button
      onClick={onBuyButtonClick}
      role='primary'
      title='Buy'
      wide={true}
    />
  </ButtonWrapper>
  <Divider />
</>}
  </>);
};

const ButtonWrapper = styled.div`
  width: 200px;
  margin-top: 24px;
`;

const Divider = styled.div`
  margin: 24px 0;
  border-top: 1px dashed ${Grey300};
`;
