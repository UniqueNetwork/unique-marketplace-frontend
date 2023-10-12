import React, { FC, useMemo } from 'react';
import { Text } from '@unique-nft/ui-kit';
import { generatePath, Link } from 'react-router-dom';
import styled from 'styled-components';
import { Icon } from 'components/UI/Icon/Icon';
import { Offer } from 'api/restApi/offers/types';
import { useAccounts } from 'hooks/useAccounts';
import { compareEncodedAddresses } from 'api/chainApi/utils/addressUtils';
import { formatBalance } from 'utils/textUtils';
import { timeDifference } from 'utils/timestampUtils';
import { countNestedChildren, stringToDecodedInfixOrUrlOrCidAndHash } from 'utils/helpers';
import { Primary600 } from 'styles/colors';
import config from '../../config';
import { TokensMedia } from '../TokensCard/TokensMedia';
import { useApi } from '../../hooks/useApi';
import BundleItemsCount from '../BundleItemsCount/BundleItemsCount';
import { Link as UILink } from 'components/UI';
import { BadgeEnum } from 'components/Picture';

export type TTokensCard = {
  offer: Offer
  testid: string
};

export const OfferCard: FC<TTokensCard> = ({ offer, testid }) => {
  const { selectedAccount } = useAccounts();
  const { currentChainId, chainProperties } = useApi();

  const {
    image,
    video,
    nestingChildTokens
  } = offer?.tokenDescription || {};

  const isBundle = !!nestingChildTokens?.length;

  const {
    name: collectionName,
    tokenPrefix
  } = offer?.collectionDescription || {};

  const videoProp = useMemo(() => stringToDecodedInfixOrUrlOrCidAndHash(video), [video]);

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

  const tokenPath = useMemo(() => generatePath('/:currentChainId/token/:collectionId/:tokenId', {
    currentChainId,
    collectionId: offer?.collectionId.toString(),
    tokenId: offer?.tokenId.toString()
  }), [currentChainId, offer]);

  const collectionPath = useMemo(() => generatePath('/:currentChainId/collection/:collectionId', {
    currentChainId,
    collectionId: offer?.collectionId.toString()
  }), [currentChainId, offer]);

  const tokensCount = useMemo(() => {
    if (!isBundle) return 0;
    return countNestedChildren(nestingChildTokens);
  }, [nestingChildTokens]);

  return (
    <TokensCardStyled>
      <TokensMedia
        to={tokenPath}
        tokenId={offer?.tokenId}
        imageUrl={image}
        video={videoProp}
        testid={`${testid}-token-media`}
        badges={isBundle ? [BadgeEnum.Bundle] : []}
      />
      <Description>
        <BasicDataWrapper>
          <Link to={tokenPath} title={`${tokenPrefix || ''} #${offer?.tokenId}`}>
            <Text
              size='l'
              weight='regular'
              color={'secondary-500'}
              testid={`${testid}-tokenId`}
            >
              {`${tokenPrefix || ''} #${offer?.tokenId}`}
            </Text>
          </Link>
          <Link
            data-testid={`${testid}-collection-${offer?.collectionId}-link`}
            to={collectionPath}
          >
            <Text color='primary-600' size='s'>
              {`${collectionName?.substring(0, 25) || ''} [id ${offer?.collectionId || ''}]`}
            </Text>
          </Link>
          {isBundle && <BundleItemsCount count={tokensCount || 0} testId={testid} />}
        </BasicDataWrapper>
        <TradingInfoWrapper>
          <Text size={'xs'} color={'grey-500'} >Price</Text>
          <PriceWrapper length={offer.price.parsed.toFixed(5).length}>
            <Text
              testid={`${testid}-price`}
              size='l'
            >{topBid ? `${formatBalance(Number(topBid))}` : `${formatBalance(offer.price.parsed, 4, true)}` }</Text>
            <IconStyled name={`chain-${currentChainId?.toLowerCase()}`} size={16} />
          </PriceWrapper>
        </TradingInfoWrapper>
        {/* {offer?.auction && <AuctionInfoWrapper>
          {isTopBidder && <Text
            testid={`${testid}-leading-bid`}
            size={'xs'}
            color={'additional-positive-500'}
          >Leading bid</Text>}
          {isBidder && !isTopBidder && <Text
            testid={`${testid}-outbid`}
            size={'xs'}
            color={'coral-500'}
          >Outbid</Text>}
          {!isBidder && !isTopBidder && <Text
            testid={`${testid}-bids`}
            size={'xs'}
            color={'grey-500'}
          >{
            offer.auction.bids.length > 0 ? 'Last bid' : 'Minimum bid'
          }</Text>}
          <StyledText color={'dark'} size={'xs'} testid={`${testid}-auction-close-time`}>{`${timeDifference(new Date(offer.auction?.stopAt || '').getTime() / 1000)} left`}</StyledText>
        </AuctionInfoWrapper>} */}
      </Description>
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

const BasicDataWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
  flex-grow: 1;
`;

const PriceWrapper = styled.div<{ length: number }>` 
  display: flex;
  align-items: center;
  span:first-child {
    font-size: ${({ length }) => `${length > 11 ? 18 - (length - 11) : 18}px !important`}
  }
  span {
    white-space: nowrap;
  }
`;

const TradingInfoWrapper = styled.div` 
  display: flex;
  margin-top: calc(var(--gap) / 2);
  column-gap: calc(var(--gap) / 4);
  align-items: center;
  justify-content: space-between;
`;

const Description = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  span {
    color: ${Primary600};
  }
`;

const AuctionInfoWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
`;

const IconStyled = styled(Icon)`
  margin: 0 calc(var(--gap) / 4);
`;
