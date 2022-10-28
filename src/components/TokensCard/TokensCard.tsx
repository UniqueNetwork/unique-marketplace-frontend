import React, { FC, useEffect, useMemo, useState } from 'react';
import { Loader, Text } from '@unique-nft/ui-kit';
import { CollectionInfoWithSchema, TokenByIdResult } from '@unique-nft/substrate-client/tokens';
import { generatePath, Link } from 'react-router-dom';
import styled from 'styled-components';
import { Icon, Link as UILink } from 'components/UI';
import { compareEncodedAddresses } from 'api/uniqueSdk/utils/addressUtils';
import { Offer } from 'api/restApi/offers/types';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import { formatKusamaBalance } from 'utils/textUtils';
import { timeDifference } from 'utils/timestampUtils';
import { Primary600 } from 'styles/colors';
import config from 'config';
import { TokensMedia } from './TokensMedia';
import { countNestedChildren, stringToDecodedInfixOrUrlOrCidAndHash } from 'utils/helpers';
import { useCollections } from 'hooks/useCollections';
import BundleItemsCount from '../BundleItemsCount/BundleItemsCount';

export type TTokensCard = {
  token?: TokenByIdResult
  offer?: Partial<Offer>
  tokenId?: number
  collectionId?: number
  tokenImageUrl?: string
  testid: string
};

export const TokensCard: FC<TTokensCard> = ({ collectionId, tokenId, offer, testid, ...props }) => {
  const [token, setToken] = useState<TokenByIdResult | undefined>(props.token);
  const [collection, setCollection] = useState<(CollectionInfoWithSchema) | undefined>();
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isBundleState, setIsBundleState] = useState<boolean>();
  const [tokensCount, setTokensCount] = useState<number>();

  const { api, currentChainId } = useApi();
  const { selectedAccount } = useAccounts();
  const { getCollection } = useCollections();

  const {
    tokenTitle,
    collectionTitle,
    imageUrl,
    price,
    auction,
    video
  } = useMemo(() => {
    if (offer || (token && collection)) {
      const { image, video } = offer?.tokenDescription || token || {};
      const { name: collectionName, tokenPrefix } = offer?.collectionDescription || collection || {};
      const { auction, price } = offer || {};
      return {
        tokenTitle: `${tokenPrefix || ''} #${tokenId || ''}`,
        collectionTitle: `${collectionName?.substring(0, 25) || ''} [id ${collectionId || ''}]`,
        imageUrl: image,
        video: stringToDecodedInfixOrUrlOrCidAndHash(video),
        auction,
        price
      };
    }

    if (tokenId && collectionId) {
      setIsFetching(true);
      (async () => {
        if (!token) {
          const token = await api?.nft?.getToken(collectionId, tokenId);
          if (token) setToken(token);
        }

        if (!collection) {
          const collection = await getCollection(collectionId);
          if (collection) setCollection(collection);
        }
        setIsFetching(false);
      })();
    }
    return {};
  }, [collectionId, tokenId, collection, token, api]);

  useEffect(() => {
    (async () => {
      let count;
      if (offer) {
        count = countNestedChildren(offer?.tokenDescription?.nestingChildTokens || []);
      } else if (tokenId && collectionId) {
        const bundle = await api?.nft?.getBundle(collectionId, tokenId);
        count = countNestedChildren(bundle?.nestingChildTokens || []);
      }
      setIsBundleState(!!count);
      setTokensCount(count);
    })();
  }, [offer, tokenId, collectionId, api?.nft]);

  const isBidder = useMemo(() => {
    if (!selectedAccount) return false;
    return auction?.bids.some((bid) => compareEncodedAddresses(bid.bidderAddress, selectedAccount.getAddress()));
  }, [auction, selectedAccount]);

  const topBid = useMemo(() => {
    if (!auction?.bids?.length) return null;
    return auction.bids[0].balance;
  }, [auction]);

  const isTopBidder = useMemo(() => {
    if (!selectedAccount || !isBidder || !topBid || !auction?.bids?.[0]?.bidderAddress) return false;
    return compareEncodedAddresses(auction.bids[0].bidderAddress, selectedAccount.getAddress());
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
        badge={isBundleState ? 'Bundle' : ''}
      />
      <Description>
        <Link to={tokenPath} title={tokenTitle}>
          <Text
            size='l'
            weight='regular'
            testid={`${testid}-tokenId`}
          >
            {tokenTitle}
          </Text>
        </Link>
        <UILink
          data-testid={`${testid}-collection-${collectionId}-link`}
          href={`${config.blockchains[currentChainId || '']?.scanUrl || ''}collections/${collectionId || ''}`}
          target={'_blank'}
          rel='noreferrer'
        >
          <Text color='primary-600' size='s'>
            {collectionTitle}
          </Text>
        </UILink>
        {isBundleState && <BundleItemsCount count={tokensCount || 0} testId={testid} />}
        {price && <PriceWrapper>
          <Text
            testid={`${testid}-price`}
            size='s'
          >{topBid ? `${formatKusamaBalance(Number(topBid))}` : `${formatKusamaBalance(price)}` }</Text>
          <IconStyled name={'chain-kusama'} size={16} />
          {!auction && <Text size={'xs'} color={'grey-500'} >Price</Text>}
        </PriceWrapper>}
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

const AuctionInfoWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
`;

const IconStyled = styled(Icon)`
  margin: 0 calc(var(--gap) / 4);
`;
