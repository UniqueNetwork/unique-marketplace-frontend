import React, { FC, useContext, useMemo } from 'react';

import { Offer } from '../../../api/restApi/offers/types';
import accountContext from '../../../account/AccountContext';
import { SellToken } from '../SellToken/SellToken';
import { BuyToken } from '../BuyToken/BuyToken';
import Auction from '../Auction/Auction';
import { isTokenOwner } from 'api/chainApi/utils/addressUtils';
import { useApi } from '../../../hooks/useApi';
import { checkAllowedTokenInSettings } from 'api/chainApi/utils/checkTokenIsAllowed';
import { TokenByIdResponse } from '@unique-nft/sdk';
import { ethers } from 'ethers';

interface TokenTradingProps {
  token?: TokenByIdResponse
  offer?: Offer
  onSellClick(): void
  onBuyClick(): void
  onTransferClick(): void
  onPlaceABidClick(): void
  onDelistClick(): void
  onDelistAuctionClick(): void
  onWithdrawClick(): void
  onAuctionClose(newOwnerAddress: string): void
  testid: string
}

export const TokenTrading: FC<TokenTradingProps> = ({ token, offer, onSellClick, onTransferClick, onDelistClick, onDelistAuctionClick, onPlaceABidClick, onWithdrawClick, onBuyClick, onAuctionClose, testid }) => {
  const { selectedAccount } = useContext(accountContext);
  const { settings } = useApi();

  const isAllowed = useMemo(() => {
    const { tokenId, collectionId } = offer || token || {};
    if (!tokenId || !collectionId) return;
    return checkAllowedTokenInSettings(tokenId, collectionId, settings?.blockchain.unique.collections);
  }, [settings, token, offer]);

  const isOwner = useMemo(() => {
    if (!selectedAccount) return false;
    if (offer) {
      return isTokenOwner(selectedAccount.address, offer.seller);
    }
    return token?.owner ? isTokenOwner(selectedAccount.address, token.owner) : false;
  }, [selectedAccount, token, offer]);

  const royalty = useMemo(() => {
    const tokenRoyalties = token?.royalties?.reduce((acc, { value, decimals }) => {
      acc += Number(ethers.utils.formatUnits(value.toString(), decimals));
      return acc;
    }, 0) || 0;
    return tokenRoyalties + (token?.collection.schema?.royalties?.reduce((acc, { value, decimals }) => {
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
      offer={offer}
      royalty={royalty}
      isAllowed={isAllowed}
      onSellClick={onSellClick}
      onTransferClick={onTransferClick}
      onDelistClick={onDelistClick}
      testid={`${testid}-sell`}
    />);
  }

  if (!isAllowed) return null;

  return (
    <BuyToken
      offer={offer}
      royalty={royalty}
      onBuy={onBuyClick}
      testid={`${testid}-buy`}
    />
  );
};
