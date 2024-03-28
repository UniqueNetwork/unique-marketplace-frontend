import React, { FC, useEffect, useMemo, useState } from 'react';
import { generatePath, Link } from 'react-router-dom';
import styled from 'styled-components';
import { Icon, Loader, Text } from 'components/UI';
import { isTokenOwner } from 'api/chainApi/utils/addressUtils';
import { Offer } from 'api/restApi/offers/types';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import { formatBalance, shortcutText } from 'utils/textUtils';
import { Primary600 } from 'styles/colors';
import { TokensMedia } from './TokensMedia';
import { countNestedChildren, stringToDecodedInfixOrUrlOrCidAndHash } from 'utils/helpers';
import { useCollections } from 'hooks/useCollections';
import { TokenByIdResponse } from '@unique-nft/sdk';
import { MyToken, TokenTypeEnum } from 'pages/MyTokens/types';
import { BadgeEnum } from 'components/TokenMedia/Picture';
import { CollectionTitle } from 'components/OfferCard/CollectionTitle';
import { GQLCollection } from 'api/scanApi/types';

export type TTokensCard = {
  token?: Omit<TokenByIdResponse | MyToken, 'collection' | 'nestingParentToken' | 'properties'>
  offer?: Partial<Offer>
  tokenId?: number
  collectionId?: number
  tokenImageUrl?: string
  testid: string
  showOwner?: boolean
  showCollectionLink?: boolean
};

export const TokensCard: FC<TTokensCard> = ({
  collectionId,
  tokenId,
  offer,
  testid,
  showOwner,
  showCollectionLink = true,
  ...props
}) => {
  const [token, setToken] = useState<Omit<TokenByIdResponse | MyToken, 'collection' | 'nestingParentToken' | 'properties'> | undefined>(props.token);
  const [collection, setCollection] = useState<(GQLCollection) | undefined>();
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isBundleState, setIsBundleState] = useState<boolean>();
  const [isNestedState, setIsNestedState] = useState<boolean>();
  const [tokensCount, setTokensCount] = useState<number>();

  const { api, currentChainId } = useApi();
  const { selectedAccount } = useAccounts();
  const { getCollection } = useCollections();
  const {
    tokenPrefix,
    collectionTitle,
    imageUrl,
    price,
    video,
    owner,
    type,
    amount,
    totalPieces
  } = useMemo(() => {
    if (offer || (token && collection) || ((token as MyToken)?.collectionName && (token as MyToken).tokenPrefix)) {
      const { image, video, owner } = offer?.tokenDescription || token || {};
      const collectionName = offer?.collectionDescription?.name || collection?.name || (token as MyToken)?.collectionName || '';
      const tokenPrefix = offer?.collectionDescription?.tokenPrefix || collection?.tokenPrefix || (token as MyToken)?.tokenPrefix || '';
      const { price, seller } = offer || {};
      return {
        tokenPrefix,
        collectionTitle: collectionName,
        imageUrl: image,
        video: stringToDecodedInfixOrUrlOrCidAndHash(video),
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

  const tokenPath = useMemo(() => {
    if (owner && type === TokenTypeEnum.RFT) {
      return generatePath('/:currentChainId/token/:address/:collectionId/:tokenId', {
        currentChainId: currentChainId || null,
        address: owner,
        collectionId: collectionId?.toString() || null,
        tokenId: tokenId?.toString() || null
      });
    }
    return generatePath('/:currentChainId/token/:collectionId/:tokenId', {
      currentChainId: currentChainId || null,
      collectionId: collectionId?.toString() || null,
      tokenId: tokenId?.toString() || null
    });
  }, [currentChainId, collectionId, tokenId, type, owner]);

  const isOwner = useMemo(() => {
    if (!selectedAccount?.address || !owner) return false;
    return isTokenOwner(selectedAccount.address, owner);
  }, [selectedAccount?.address, owner]);

  const isCustomizable = useMemo(() => {
    if (!collection && token?.collectionId) {
      void (async () => {
        const collection = await getCollection(token?.collectionId);
        if (collection) setCollection(collection);
      })();
      return;
    }
    return !!collection?.properties?.find(({ key }) => key === 'is_customizable')?.value;
  }, [collection, getCollection, token?.collectionId]);

  return (
    <TokensCardStyled>
      <TokensMedia
        to={tokenPath}
        tokenId={tokenId}
        imageUrl={imageUrl}
        video={video}
        testid={`${testid}-token-media`}
        badges={isCustomizable ? [BadgeEnum.Customizable] : []}
      />
      <Description>
        <BasicDataWrapper>
          <Link to={tokenPath} title={tokenPrefix}>
            <Text
              size='l'
              weight='regular'
              testid={`${testid}-tokenId`}
              className='token-title'
            >
              <span>{tokenPrefix} </span>
              <span>#{tokenId}</span>
            </Text>
          </Link>
          {showCollectionLink && <Link
            data-testid={`${testid}-collection-${collectionId}-link`}
            to={`/${currentChainId?.toLowerCase()}/collection/${collectionId || ''}`}
          >
            <CollectionTitle
              collectionId={collectionId || 0}
              collectionName={collectionTitle || ''}
            />
          </Link>}
          {showOwner && <Text size={'s'} color={'grey-500'}>{isOwner ? 'You own it' : `Owned by: ${shortcutText(owner || '')}`}</Text>}
        </BasicDataWrapper>
        {!!price?.parsed && <TradingInfoWrapper>
          <Text size={'xs'} color={'grey-500'} >Price</Text>
          <PriceWrapper length={price.parsed.toFixed(5).length}>
            <Text
              testid={`${testid}-price`}
              size='l'
            >{formatBalance(price.parsed, 4, true)}</Text>
            <IconStyled name={`chain-${currentChainId?.toLowerCase()}`} size={16} />
          </PriceWrapper>
        </TradingInfoWrapper>}
        {type === TokenTypeEnum.RFT && !!amount && !!totalPieces && <Text size={'xs'} color={'grey-500'} >
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
  background: #fff;
  border-radius: 8px;
  transition: transform 0.2s;
  box-shadow: 0 4px 14px rgba(0,0,0,.08);
  padding: 12px 12px 8px 12px;

  &:hover {
    z-index: 10;
    transform: scale(1.05);
  }
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
  & > span {
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
  margin-top: calc(var(--prop-gap) / 2);
  column-gap: calc(var(--prop-gap) / 4);
  align-items: center;
  justify-content: space-between;
`;

const IconStyled = styled(Icon)`
  margin: 0 calc(var(--prop-gap) / 4);
`;
