import React, { FC, useContext, useMemo } from 'react';

import { NFTToken } from '../../../api/chainApi/unique/types';
import { Offer } from '../../../api/restApi/offers/types';
import accountContext from '../../../account/AccountContext';
import { SellToken } from '../SellToken/SellToken';
import { BuyToken } from '../BuyToken/BuyToken';
import Auction from '../Auction/Auction';
import { isTokenOwner, normalizeAccountId } from '../../../api/chainApi/utils/addressUtils';

interface TokenTradingProps {
  token?: NFTToken
  offer?: Offer
  onSellClick(): void
  onBuyClick(): void
  onTransferClick(): void
  onPlaceABidClick(): void
  onDelistClick(): void
  onDelistAuctionClick(): void
  onWithdrawClick(): void
  onAuctionClose(newOwnerAddress: string): void
}

export const TokenTrading: FC<TokenTradingProps> = ({ token, offer, onSellClick, onTransferClick, onDelistClick, onDelistAuctionClick, onPlaceABidClick, onWithdrawClick, onBuyClick, onAuctionClose }) => {
  const { selectedAccount } = useContext(accountContext);

  const isOwner = useMemo(() => {
    const owner = { Substrate: offer?.seller } || token?.owner;
    if (!selectedAccount || !owner) return false;
    return isTokenOwner(selectedAccount.address, owner);
  }, [selectedAccount, token, offer]);

  if (offer?.auction) {
    return (<Auction
      offer={offer}
      onPlaceABidClick={onPlaceABidClick}
      onWithdrawClick={onWithdrawClick}
      onDelistAuctionClick={onDelistAuctionClick}
      onClose={onAuctionClose}
    />);
  }

  if (isOwner) {
    return (<SellToken
      offer={offer}
      onSellClick={onSellClick}
      onTransferClick={onTransferClick}
      onDelistClick={onDelistClick}
    />);
  }

  return (
    <BuyToken offer={offer} onBuy={onBuyClick}/>
  );
};
