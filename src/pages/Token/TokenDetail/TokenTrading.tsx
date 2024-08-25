import React, { FCC, useContext, useMemo } from 'react';
import { CollectionWithInfoV2Dto, TokenWithInfoV2Dto } from '@unique-nft/sdk';
import { Offer } from '../../../api/restApi/offers/types';
import accountContext from '../../../account/AccountContext';
import { SellToken } from '../SellToken/SellToken';
import { BuyToken } from '../BuyToken/BuyToken';
import { isTokenOwner } from 'api/chainApi/utils/addressUtils';
import { useApi } from '../../../hooks/useApi';
import { checkAllowedTokenInSettings } from 'api/chainApi/utils/checkTokenIsAllowed';
import { useParams } from 'react-router-dom';
import { disallowSellingAttributeName, disallowSellingAttributeValue } from '../constants';

interface TokenTradingProps {
  token?: TokenWithInfoV2Dto
  collection?: CollectionWithInfoV2Dto | null
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

export const TokenTrading: FCC<TokenTradingProps> = ({
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
    if (!(collection?.limits?.transfersEnabled !== false)) return false;

    // for FHF
    if (Object.values(token?.attributes || {}).some(({ trait_type, value }) =>
      trait_type === disallowSellingAttributeName &&
      (value as string ) === disallowSellingAttributeValue)) {
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
   //TO DO update after implement royalties into V2

    // const tokenRoyalties = token?.royalties?.reduce((acc, { value, decimals }) => {
    //   acc += Number(ethers.utils.formatUnits(value.toString(), decimals));
    //   return acc;
    // }, 0) || 0;
    // return tokenRoyalties + (collection?.schema?.royalties?.reduce((acc, { value, decimals }) => {
    //   acc += Number(ethers.utils.formatUnits(value.toString(), decimals));
    //   return acc;
    // }, 0) || 0);
    return 0;
  }, [token]);

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
