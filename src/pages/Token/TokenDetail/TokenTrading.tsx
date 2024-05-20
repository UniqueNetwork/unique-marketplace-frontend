import React, { FC, useContext, useMemo } from 'react';

import { Offer } from '../../../api/restApi/offers/types';
import accountContext from '../../../account/AccountContext';
import { SellToken } from '../SellToken/SellToken';
import { BuyToken } from '../BuyToken/BuyToken';
import Auction from '../Auction/Auction';
import { isTokenOwner } from 'api/chainApi/utils/addressUtils';
import { useApi } from '../../../hooks/useApi';
import { checkAllowedTokenInSettings } from 'api/chainApi/utils/checkTokenIsAllowed';
import { CollectionInfoWithSchemaResponse, TokenByIdResponse } from '@unique-nft/sdk';
import { ethers } from 'ethers';
import { useParams } from 'react-router-dom';
import { disallowSellingAttributeName, disallowSellingAttributeValue } from '../constants';

interface TokenTradingProps {
  token?: TokenByIdResponse
  collection?: CollectionInfoWithSchemaResponse | null
  offer?: Offer
  onSellClick(): void
  onBuyClick(): void
  onTransferClick(): void
  onPlaceABidClick(): void
  onDelistClick(): void
  onDelistAuctionClick(): void
  onChangePriceClick(): void
  onWithdrawClick(): void
  onAuctionClose(newOwnerAddress: string): void
  testid: string
}

export const TokenTrading: FC<TokenTradingProps> = ({
  token,
  offer,
  collection,
  onSellClick,
  onTransferClick,
  onDelistClick,
  onDelistAuctionClick,
  onChangePriceClick,
  onPlaceABidClick,
  onWithdrawClick,
  onBuyClick,
  onAuctionClose,
  testid
}) => {
  const { selectedAccount } = useContext(accountContext);
  const { settings } = useApi();
  const { address } = useParams<{ address: string }>();

  const isAllowed = useMemo(() => {
    const { tokenId, collectionId } = offer || token || {};
    if (!tokenId || !collectionId) return false;
    if (!(token?.collection.limits?.transfersEnabled !== false)) return false;

    // for FHF
    if (Object.values(token?.attributes || {}).some(({ name, value }) =>
      name?._ === disallowSellingAttributeName &&
      (value as { _: string })?._ === disallowSellingAttributeValue)) {
      return false;
    }

    return checkAllowedTokenInSettings(tokenId, collectionId, settings?.blockchain.unique.collections);
  }, [settings, token, offer]);

  const isOwner = useMemo(() => {
    if (!selectedAccount) return false;
    if (collection?.mode === 'ReFungible' && address) {
      return isTokenOwner(selectedAccount.address, address);
    }

    if (offer) {
      return isTokenOwner(selectedAccount.address, offer.seller);
    }
    return token?.owner ? isTokenOwner(selectedAccount.address, token.owner) : false;
  }, [selectedAccount, token, offer, address]);

  const royalty = useMemo(() => {
    const tokenRoyalties = token?.royalties?.reduce((acc, { value, decimals }) => {
      acc += Number(ethers.utils.formatUnits(value.toString(), decimals));
      return acc;
    }, 0) || 0;
    return tokenRoyalties + (token?.collection?.schema?.royalties?.reduce((acc, { value, decimals }) => {
      acc += Number(ethers.utils.formatUnits(value.toString(), decimals));
      return acc;
    }, 0) || 0);
  }, [token]);

  if (offer?.auction) {
    return (<Auction
      offer={offer}
      onPlaceABidClick={onPlaceABidClick}
      onWithdrawClick={onWithdrawClick}
      onDelistAuctionClick={onDelistAuctionClick}
      onClose={onAuctionClose}
      testid={`${testid}-auction`}
    />);
  }
  if (isOwner) {
    return (<SellToken
      collectionId={token?.collectionId}
      offer={offer}
      royalty={royalty}
      isAllowed={isAllowed}
      isRFT={collection?.mode === 'ReFungible'}
      onSellClick={onSellClick}
      onTransferClick={onTransferClick}
      onDelistClick={onDelistClick}
      onChangePriceClick={onChangePriceClick}
      testid={`${testid}-sell`}
    />);
  }

  if (!isAllowed || offer?.collectionId === 611) return null;

  return (
    <BuyToken
      offer={offer}
      royalty={royalty}
      onBuy={onBuyClick}
      testid={`${testid}-buy`}
    />
  );
};
