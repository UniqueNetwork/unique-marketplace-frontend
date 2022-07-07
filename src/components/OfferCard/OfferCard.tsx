import React, { FC, useEffect, useMemo, useState } from 'react';
import { Icon, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';

import { Picture } from '..';
import { formatKusamaBalance, shortcutText } from '../../utils/textUtils';
import { Offer } from '../../api/restApi/offers/types';
import { compareEncodedAddresses } from '../../api/chainApi/utils/addressUtils';
import { useAccounts } from '../../hooks/useAccounts';
import { timeDifference } from '../../utils/timestampUtils';
import config from '../../config';
import { Primary600 } from '../../styles/colors';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { NFTCollection } from '../../api/chainApi/unique/types';

export type TTokensCard = {
  offer: Offer
};

export const OfferCard: FC<TTokensCard> = ({ offer }) => {
  const { selectedAccount } = useAccounts();
  // TODO: remove this after the API provides complete collection details (cover, sponsorship, etc)
  const { api } = useApi();
  const collectionApi = api?.collection;
  const [collectionDetails, setCollectionDetails] = useState<NFTCollection | null>();
  useEffect(() => {
    (async () => {
      setCollectionDetails(await collectionApi?.getCollection(offer.collectionId));
    })();
  }, [offer.collectionId, collectionApi]);

  const {
    collectionName,
    image,
    prefix
  } = offer?.tokenDescription || {};

  const isBidder = useMemo(() => {
    if (!selectedAccount) return false;
    return offer?.auction?.bids.some((bid) => compareEncodedAddresses(bid.bidderAddress, selectedAccount.address));
  }, [offer, selectedAccount]);

  const topBid = useMemo(() => {
    if (!offer?.auction?.bids?.length) return null;
    return offer?.auction?.bids[0].balance;
  }, [offer]);

  const isTopBidder = useMemo(() => {
    if (!selectedAccount || !isBidder || !topBid) return false;
    return compareEncodedAddresses(offer?.auction!.bids[0].bidderAddress, selectedAccount.address);
  }, [isBidder, topBid, selectedAccount]);

  return (
    <TokensCardStyled>
      <PictureWrapper to={`/token/${offer?.collectionId}/${offer?.tokenId}`}>
        <Picture alt={offer?.tokenId?.toString() || ''} src={image} />
      </PictureWrapper>
      <Description>
        <Link to={`/token/${offer?.collectionId}/${offer?.tokenId}`} title={`${prefix || ''} #${offer?.tokenId}`}>
          <Text size='l' weight='regular' color={'secondary-500'}>
            {`${prefix || ''} #${offer?.tokenId}`}
          </Text>
        </Link>
        <a href={`${config.scanUrl || ''}collections/${offer?.collectionId}`} target={'_blank'} rel='noreferrer'>
          <Text color='primary-600' size='s'>
            {`${collectionName?.substring(0, 15) || ''} [id ${offer?.collectionId || ''}]`}
          </Text>
        </a>
        <PriceWrapper>
          <Text size='l'>{topBid ? `${formatKusamaBalance(Number(topBid))}` : `${formatKusamaBalance(offer?.price)}` }</Text>
          <Icon name={'chain-kusama'} size={16} />
        </PriceWrapper>
        {!offer?.auction && <Text size={'xs'} color={'grey-500'} >Price</Text>}
        {offer?.auction && <AuctionInfoWrapper>
          {isTopBidder && <Text size={'xs'} color={'additional-positive-500'} >Leading bid</Text>}
          {isBidder && !isTopBidder && <Text size={'xs'} color={'coral-500'} >Outbid</Text>}
          {!isBidder && !isTopBidder && <Text size={'xs'} color={'grey-500'} >{
            offer.auction.bids.length > 0 ? 'Last bid' : 'Minimum bid'
          }</Text>}
          <StyledText color={'dark'} size={'xs'}>{`${timeDifference(new Date(offer.auction?.stopAt || '').getTime() / 1000)} left`}</StyledText>
        </AuctionInfoWrapper>}
        {collectionDetails?.sponsorship?.confirmed && <Row>
          <Text size='s' color={'grey-500'} >Sponsor:</Text>
          <Text size='s' >{shortcutText(collectionDetails.sponsorship.confirmed)}</Text>
        </Row>}
      </Description>
    </TokensCardStyled>
  );
};

const TokensCardStyled = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: center;
  position: relative;
  cursor: pointer;
`;

const PictureWrapper = styled(Link)`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;

  &::before {
    content: "";
    display: block;
    padding-top: 100%;
  }

  .picture {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    color: white;
    text-align: center;
    max-height: 100%;
    border-radius: 8px;
    transition: 50ms;
    overflow: hidden;

    img {
      max-width: 100%;
      max-height: 100%;
    }

    svg {
      border-radius: 8px;
    }
    
    &:hover {
      transform: translate(0, -5px);
      text-decoration: none;
    }
  }
`;

const PriceWrapper = styled.div` 
  display: flex;
  align-items: center;
  column-gap: calc(var(--gap) / 4);
  margin-top: calc(var(--gap) / 2);
`;

const StyledText = styled(Text)` 
  && {
    color: var(--color-additional-dark);
  }
`;

const Description = styled.div`
  display: flex;
  flex-direction: column;

  span {
    color: ${Primary600};
  }
`;

const AuctionInfoWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
`;

const Row = styled.div` 
  && {
    display: flex;
    align-items: center;
    column-gap: calc(var(--gap) / 4);
  }
`;
