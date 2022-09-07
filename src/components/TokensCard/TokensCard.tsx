import React, { FC, useMemo, useState } from 'react';
import { Icon, Loader, Text } from '@unique-nft/ui-kit';
import { generatePath, Link } from 'react-router-dom';
import styled from 'styled-components';

import { NFTToken } from 'api/uniqueSdk/types';
import { compareEncodedAddresses } from 'api/uniqueSdk/utils/addressUtils';
import { Offer } from 'api/restApi/offers/types';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import { formatKusamaBalance } from 'utils/textUtils';
import { timeDifference } from 'utils/timestampUtils';
import { Primary600 } from 'styles/colors';
import config from '../../config';
import { TokensMedia } from './TokensMedia';

export type TTokensCard = {
  token?: NFTToken & Partial<Offer>
  tokenId?: number
  collectionId?: number
  tokenImageUrl?: string
  testid: string
};

export const TokensCard: FC<TTokensCard> = ({ collectionId, tokenId, testid, ...props }) => {
  const [token, setToken] = useState<(NFTToken & Partial<Offer>) | undefined>(props.token);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const { api, currentChainId } = useApi();
  const { selectedAccount } = useAccounts();

  const {
    collectionName,
    imageUrl,
    prefix,
    price,
    auction,
    video
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

  const tokenPath = useMemo(() => generatePath('/:currentChainId/token/:collectionId/:tokenId', {
    currentChainId,
    collectionId: collectionId?.toString(),
    tokenId: tokenId?.toString()
  }), [currentChainId, collectionId, tokenId]);

  return (
    <TokensCardStyled>
      <TokensMedia
        to={tokenPath}
        tokenId={tokenId}
        imageUrl={imageUrl}
        video={video}
        testid={`${testid}-token-media`}
      />
      <Description>
        <Link to={tokenPath} title={`${prefix || ''} #${tokenId}`}>
          <Text
            size='l'
            weight='regular'
            testid={`${testid}-tokenId`}
          >
            {`${prefix || ''} #${tokenId || ''}`}
          </Text>
        </Link>
        <a
          data-testid={`${testid}-collection-${collectionId}-link`}
          href={`${config.blockchains[currentChainId || '']?.scanUrl || ''}collections/${collectionId || ''}`}
          target={'_blank'}
          rel='noreferrer'
        >
          <Text color='primary-600' size='s'>
            {`${collectionName?.substring(0, 25) || ''} [id ${collectionId || ''}]`}
          </Text>
        </a>
        {price && <PriceWrapper>
          <Text
            testid={`${testid}-price`}
            size='s'
          >{topBid ? `${formatKusamaBalance(Number(topBid))}` : `${formatKusamaBalance(price)}` }</Text>
          <Icon name={'chain-kusama'} size={16} />
        </PriceWrapper>}
        {price && !auction && <Text size={'xs'} color={'grey-500'} >Price</Text>}
        {auction && <AuctionInfoWrapper>
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
