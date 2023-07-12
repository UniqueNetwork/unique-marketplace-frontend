import React, { FC, useEffect, useMemo, useState } from 'react';
import { Loader, Text } from '@unique-nft/ui-kit';
import { generatePath, Link } from 'react-router-dom';
import styled from 'styled-components';
import { Icon } from 'components/UI';
import { compareEncodedAddresses, isTokenOwner } from 'api/chainApi/utils/addressUtils';
import { Offer } from 'api/restApi/offers/types';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import { formatBalance, shortcutText } from 'utils/textUtils';
import { Primary600 } from 'styles/colors';
import { TokensMedia } from './TokensMedia';
import { countNestedChildren, stringToDecodedInfixOrUrlOrCidAndHash } from 'utils/helpers';
import { useCollections } from 'hooks/useCollections';
import BundleItemsCount from '../BundleItemsCount/BundleItemsCount';
import { CollectionInfoWithSchemaResponse, TokenByIdResponse } from '@unique-nft/sdk';
import { MyToken, TokenTypeEnum } from 'pages/MyTokens/types';

export type TTokensCard = {
  token?: Omit<TokenByIdResponse | MyToken, 'collection' | 'nestingParentToken' | 'properties'>
  offer?: Partial<Offer>
  tokenId?: number
  collectionId?: number
  tokenImageUrl?: string
  testid: string
  showOwner?: boolean
};

export const TokensCard: FC<TTokensCard> = ({ collectionId, tokenId, offer, testid, showOwner, ...props }) => {
  const [token, setToken] = useState<Omit<TokenByIdResponse | MyToken, 'collection' | 'nestingParentToken' | 'properties'> | undefined>(props.token);
  const [collection, setCollection] = useState<(CollectionInfoWithSchemaResponse) | undefined>();
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isBundleState, setIsBundleState] = useState<boolean>();
  const [isNestedState, setIsNestedState] = useState<boolean>();
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
    video,
    owner,
    type,
    amount,
    totalPieces
  } = useMemo(() => {
    if (offer || (token && collection) || ((token as MyToken).collectionName && (token as MyToken).tokenPrefix)) {
      const { image, video, owner } = offer?.tokenDescription || token || {};
      const collectionName = offer?.collectionDescription?.name || collection?.name || (token as MyToken)?.collectionName || '';
      const tokenPrefix = offer?.collectionDescription?.tokenPrefix || collection?.tokenPrefix || (token as MyToken)?.tokenPrefix || '';
      const { auction, price, seller } = offer || {};
      return {
        tokenTitle: `${tokenPrefix || ''} #${tokenId || ''}`,
        collectionTitle: `${collectionName?.substring(0, 25) || ''} [id ${collectionId || ''}]`,
        imageUrl: image,
        video: stringToDecodedInfixOrUrlOrCidAndHash(video),
        auction,
        price,
        owner: seller || owner,
        type: (token as MyToken)?.type || TokenTypeEnum.NFT,
        amount: (token as MyToken)?.tokens_amount,
        totalPieces: (token as MyToken)?.total_pieces
      };
    }

    if (tokenId && collectionId) {
      setIsFetching(true);
      void (async () => {
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
    void (async () => {
      let count;
      if (offer) {
        count = countNestedChildren(offer?.tokenDescription?.nestingChildTokens || []);
      } else if ((token as MyToken)?.nested !== undefined) {
        count = (token as MyToken).childrenCount;
      } else if (tokenId && collectionId) {
        const bundle = await api?.nft?.getBundle(collectionId, tokenId);
        count = countNestedChildren(bundle?.nestingChildTokens || []);
      }
      setIsBundleState(!!count);
      setTokensCount(count);
      setIsNestedState(!!offer?.tokenDescription?.nestingParentToken);
    })();
  }, [offer, tokenId, collectionId, api?.nft]);

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

  const tokenPath = useMemo(() => {
    if (type === TokenTypeEnum.RFT) {
      return generatePath('/:currentChainId/token/:address/:collectionId/:tokenId', {
        currentChainId,
        address: owner,
        collectionId: collectionId?.toString(),
        tokenId: tokenId?.toString()
      });
    }
    return generatePath('/:currentChainId/token/:collectionId/:tokenId', {
      currentChainId,
      collectionId: collectionId?.toString(),
      tokenId: tokenId?.toString()
    });
  }, [currentChainId, collectionId, tokenId, type, owner]);

  const isOwner = useMemo(() => {
    if (!selectedAccount?.address || !owner) return false;
    return isTokenOwner(selectedAccount.address, owner);
  }, [selectedAccount?.address, owner]);

  const badges = [
    ...(collection?.mode === 'ReFungible' ? ['Fractional'] : []),
    ...(isNestedState ? ['Nested'] : isBundleState ? ['Bundle'] : [])
  ];

  return (
    <TokensCardStyled>
      <TokensMedia
        to={tokenPath}
        tokenId={tokenId}
        imageUrl={imageUrl}
        video={video}
        testid={`${testid}-token-media`}
        badges={badges}
      />
      <Description>
        <BasicDataWrapper>
          <Link to={tokenPath} title={tokenTitle}>
            <Text
              size='l'
              weight='regular'
              testid={`${testid}-tokenId`}
            >
              {tokenTitle}
            </Text>
          </Link>
          <Link
            data-testid={`${testid}-collection-${collectionId}-link`}
            to={`/${currentChainId?.toLowerCase()}/collection/${collectionId || ''}`}
          >
            <Text color='primary-600' size='s'>
              {collectionTitle}
            </Text>
          </Link>
          {showOwner && <Text size={'s'} color={'grey-500'}>{isOwner ? 'You own it' : `Owned by: ${shortcutText(owner || '')}`}</Text>}
          {isBundleState && <BundleItemsCount count={tokensCount || 0} testId={testid} />}
        </BasicDataWrapper>
        {!!price?.parsed && <TradingInfoWrapper>
          <Text size={'xs'} color={'grey-500'} >Price</Text>
          <PriceWrapper length={price.parsed.toFixed(5).length}>
            <Text
              testid={`${testid}-price`}
              size='l'
            >{topBid ? `${formatBalance(Number(topBid))}` : `${formatBalance(price.parsed, 4, true)}` }</Text>
            <IconStyled name={`chain-${currentChainId?.toLowerCase()}`} size={16} />
          </PriceWrapper>
        </TradingInfoWrapper>}
        {/* {auction && <AuctionInfoWrapper>
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
        </AuctionInfoWrapper>} */}
        {type === TokenTypeEnum.RFT && <Text size={'xs'} color={'grey-500'} >
          Owned fractions: {amount}/{totalPieces}
        </Text>}
      </Description>

      {!!isFetching && <Loader isFullPage />}
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

const Description = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  span {
    color: ${Primary600};
  }
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
