import React, { FC, useMemo, useState } from 'react';
import { Icon, Loader, Text } from '@unique-nft/ui-kit';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { NFTToken } from 'api/uniqueSdk/types';
import { compareEncodedAddresses } from 'api/uniqueSdk/utils/addressUtils';
import { Offer } from 'api/restApi/offers/types';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import { Picture } from '..';
import { formatKusamaBalance } from 'utils/textUtils';
import { timeDifference } from 'utils/timestampUtils';
import { Primary600 } from 'styles/colors';
import config from '../../config';

export type TTokensCard = {
  token?: NFTToken & Partial<Offer>
  tokenId?: number
  collectionId?: number
  tokenImageUrl?: string
};

export const TokensCard: FC<TTokensCard> = ({ collectionId, tokenId, ...props }) => {
  const [token, setToken] = useState<(NFTToken & Partial<Offer>) | undefined>(props.token);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const { api } = useApi();
  const { selectedAccount } = useAccounts();

  const {
    collectionName,
    imageUrl,
    prefix,
    price,
    auction
  } = useMemo<Partial<Offer & NFTToken>>(() => {
    if (token?.tokenDescription) {
      const { collectionName, prefix, image } = token.tokenDescription;
      return { ...token,
        collectionName,
        prefix,
        imageUrl: image };
    }

    if (token) {
      return token;
    }

    if (tokenId && collectionId) {
      setIsFetching(true);
      void api?.nft?.getToken(collectionId, tokenId).then((token: NFTToken | null) => {
        setIsFetching(false);
        if (token) { setToken(token); }
      });
    }
    return {};
  }, [collectionId, tokenId, token, api]);

  const isBidder = useMemo(() => {
    if (!selectedAccount) return false;
    return auction?.bids.some((bid) => compareEncodedAddresses(bid.bidderAddress, selectedAccount.address));
  }, [auction, selectedAccount]);

  const topBid = useMemo(() => {
    if (!auction?.bids?.length) return null;
    return auction.bids[0].balance;
  }, [auction]);

  const isTopBidder = useMemo(() => {
    if (!selectedAccount || !isBidder || !topBid || !auction?.bids?.[0]?.bidderAddress) return false;
    return compareEncodedAddresses(auction.bids[0].bidderAddress, selectedAccount.address);
  }, [isBidder, topBid, selectedAccount, auction]);

  return (
    <TokensCardStyled>
      <PictureWrapper to={`/token/${collectionId || ''}/${tokenId || ''}`}>
        <Picture alt={tokenId?.toString() || ''} src={imageUrl} />
      </PictureWrapper>
      <Description>
        <Link to={`/token/${collectionId}/${tokenId}`} title={`${prefix || ''} #${tokenId}`}>
          <Text size='l' weight='regular'>
            {`${prefix || ''} #${tokenId || ''}`}
          </Text>
        </Link>
        <a href={`${config.scanUrl || ''}collections/${collectionId || ''}`} target={'_blank'} rel='noreferrer'>
          <Text color='primary-600' size='s'>
            {`${collectionName?.substring(0, 15) || ''} [id ${collectionId || ''}]`}
          </Text>
        </a>
        {price && <PriceWrapper>
          <Text size='s'>{topBid ? `${formatKusamaBalance(Number(topBid))}` : `${formatKusamaBalance(price)}` }</Text>
          <Icon name={'chain-kusama'} size={16} />
        </PriceWrapper>}
        {price && !auction && <Text size={'xs'} color={'grey-500'} >Price</Text>}
        {auction && <AuctionInfoWrapper>
          {isTopBidder && <Text size={'xs'} color={'additional-positive-500'} >Leading bid</Text>}
          {isBidder && !isTopBidder && <Text size={'xs'} color={'coral-500'} >Outbid</Text>}
          {!isBidder && !isTopBidder && <Text size={'xs'} color={'grey-500'} >{
            auction.bids.length > 0 ? 'Last bid' : 'Minimum bid'
          }</Text>}
          <StyledText color={'dark'} size={'xs'}>{`${timeDifference(new Date(auction?.stopAt || '').getTime() / 1000)} left`}</StyledText>
        </AuctionInfoWrapper>}
      </Description>

      {isFetching && <Loader isFullPage />}
    </TokensCardStyled>
  );
};

const TokensCardStyled = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
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

const Description = styled.div`
  display: flex;
  flex-direction: column;

  span {
    color: ${Primary600};

    &:nth-of-type(2) {
      margin-bottom: 8px;
    }
  }
`;

const PriceWrapper = styled.div` 
  display: flex;
  align-items: center;
  column-gap: calc(var(--gap) / 4);
`;

const StyledText = styled(Text)` 
  && {
    color: var(--color-additional-dark);
  }
`;

const AuctionInfoWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
`;
