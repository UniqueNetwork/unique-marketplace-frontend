import { Text } from '@unique-nft/ui-kit';
import React, { FC, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components/macro';
import { useNavigate } from 'react-router-dom';
import { Picture } from '..';
import { Primary600 } from '../../styles/colors';
import { useApi } from '../../hooks/useApi';
import Loading from '../Loading';
import { NFTToken } from '../../api/chainApi/unique/types';
import { formatKusamaBalance } from '../../utils/textUtils';
import { Offer } from "../../api/restApi/offers/types";
import { Icon } from '../Icon/Icon';
import Kusama from "../../static/icons/logo-kusama.svg";
import {compareEncodedAddresses} from "../../api/chainApi/utils/addressUtils";
import {useAccounts} from "../../hooks/useAccounts";

export type TTokensCard = {
  offer?: Offer
};

const tokenSymbol = 'KSM';

export const OfferCard: FC<TTokensCard> = ({ offer }) => {
  const [token, setToken] = useState<NFTToken | undefined>();
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const { api } = useApi();
  const { selectedAccount } = useAccounts();

  const {
    collectionName,
    imagePath,
    tokenPrefix
  } = useMemo<Record<string, any>>(() => {
    if (token) {
      return {
        collectionName: token.collectionName,
        imagePath: token.imageUrl,
        tokenPrefix: token.prefix
      };
    }

    if (offer) {
      setIsFetching(true);
      void api?.nft?.getToken(offer.collectionId, offer.tokenId).then((token) => {
        setIsFetching(false);
        setToken(token);
      });
    }
    return {};
  }, [offer, token, api]);

  const navigate = useNavigate();

  const navigateToTokenPage = useCallback(() => {
    navigate(`/token/${offer?.collectionId}/${offer?.tokenId}`);
  }, [offer, navigate]);

  const isBidder = useMemo(() => {
    if (!selectedAccount) return false;
    return offer?.auction?.bids.some((bid) => compareEncodedAddresses(bid.bidderAddress, selectedAccount.address));
  }, [offer, selectedAccount]);

  const topBid = useMemo(() => {
    return offer?.auction?.bids.reduce((top, bid) => {
      return top.amount > bid.amount ? top : bid;
    }) || null;
  }, [offer]);

  const isTopBidder = useMemo(() => {
    if (!selectedAccount || !isBidder || !topBid) return false;
    return compareEncodedAddresses(topBid.bidderAddress, selectedAccount.address);
  }, [isBidder, topBid, selectedAccount]);

  return (
    <TokensCardStyled onClick={navigateToTokenPage}>
      <PictureWrapper>
        <Picture alt={offer?.tokenId?.toString() || ''} src={imagePath} />
      </PictureWrapper>
      <Description>
        <Text size='l' weight='medium'>{`${
          tokenPrefix || ''
        } #${offer?.tokenId}`}</Text>
        <Text color='primary-600' size='s'>
          {`${collectionName?.substring(0, 15) || ''} [id ${offer?.collectionId || ''}]`}
        </Text>
        <PriceWrapper>
          <Text size='s'>{`Price: ${formatKusamaBalance(offer?.price || 0)}`}</Text>
          <Icon path={Kusama} size={16} />
        </PriceWrapper>
      </Description>

      {isFetching && <Loading />}
    </TokensCardStyled>
  );
};

const TokensCardStyled = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: center;
  position: relative;
`;

const PictureWrapper = styled.div`
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

    img {
      max-width: 100%;
      max-height: 100%;
    }

    svg {
      border-radius: 8px;
    }
  }
`;

const PriceWrapper = styled.div` 
  display: flex;
  align-items: center;
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
