import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Heading } from '@unique-nft/ui-kit';
import { Text, useNotifications, Button } from 'components/UI';
import styled from 'styled-components';
import BN from 'bn.js';

import { AdditionalPositive100, AdditionalPositive500, Coral100, Coral500, Grey300 } from 'styles/colors';
import { useOfferSubscription } from 'hooks/useOfferSubscription';
import { useAccounts } from 'hooks/useAccounts';
import { compareEncodedAddresses, isTokenOwner } from 'api/uniqueSdk/utils/addressUtils';
import { Offer } from 'api/restApi/offers/types';
import { useAuction } from 'api/restApi/auction/auction';
import { TCalculatedBid } from 'api/restApi/auction/types';
import Timer from 'components/Timer';
import AccountLink from 'components/Account/AccountLink';
import { PriceForAuction } from '../TokenDetail/PriceForAuction';
import Bids from './Bids';
import BuyBundleInformation from '../TokenDetail/BuyBundleInformation';

interface AuctionProps {
  offer: Offer
  onPlaceABidClick(): void
  onDelistAuctionClick(): void
  onWithdrawClick(): void
  onClose(newOwnerAddress: string): void
  testid: string
}

const Auction: FC<AuctionProps> = ({ offer: initialOffer, onPlaceABidClick, onDelistAuctionClick, onWithdrawClick, onClose, testid }) => {
  const [offer, setOffer] = useState<Offer>(initialOffer);
  const { selectedAccount } = useAccounts();
  const { getCalculatedBid } = useAuction();
  const { info } = useNotifications();

  const [calculatedBid, setCalculatedBid] = useState<TCalculatedBid>();

  const fetchCalculatedBid = useCallback(async () => {
    const _calculatedBid = await getCalculatedBid({
      collectionId: offer?.collectionId || 0,
      tokenId: offer?.tokenId || 0,
      bidderAddress: selectedAccount?.getAddress() || ''
    });
    setCalculatedBid(_calculatedBid);
  }, [offer?.collectionId, offer?.tokenId, selectedAccount]);

  useEffect(() => {
    if (!offer || offer.auction?.status !== 'active' || !selectedAccount) return;
    void fetchCalculatedBid();
  }, [fetchCalculatedBid]);

  const canPlaceABid = useMemo(() => {
    if (!selectedAccount || !offer?.seller) return false;
    return !isTokenOwner(selectedAccount.getAddress(), offer.seller);
  }, [offer, selectedAccount]);

  const canDelist = useMemo(() => {
    if (!selectedAccount || !offer?.seller) return false;
    return isTokenOwner(selectedAccount.getAddress(), offer.seller) && !offer.auction?.bids?.length;
  }, [offer, selectedAccount]);

  const isBidder = useMemo(() => {
    if (!selectedAccount || !calculatedBid) return false;
    return offer.auction?.bids?.some((bid) => compareEncodedAddresses(
      bid.bidderAddress,
      selectedAccount.getAddress()
    )) && calculatedBid.bidderPendingAmount !== '0';
  }, [offer, selectedAccount, calculatedBid]);

  const topBid = useMemo(() => {
    if (!offer.auction?.bids?.length) return null;
    return offer.auction.bids.reduce((top, bid) => {
      return new BN(top.balance).gt(new BN(bid.balance)) ? top : bid;
    }) || null;
  }, [offer]);

  const isTopBidder = useMemo(() => {
    if (!selectedAccount || !isBidder || !topBid) return false;
    return compareEncodedAddresses(topBid.bidderAddress, selectedAccount.getAddress());
  }, [isBidder, topBid, selectedAccount]);

  const canWithdraw = useMemo(() => {
    if (!selectedAccount) return false;
    return isBidder && !isTopBidder;
  }, [isBidder, isTopBidder, selectedAccount]);

  const onPlaceBid = useCallback((_offer: Offer) => {
    setOffer(_offer);
  }, [setOffer]);

  const onAuctionStopped = useCallback((_offer: Offer) => {
    info(
      <div data-testid={`${testid}-auction-stop-notification`}>Auction is stopped</div>,
      { name: 'success', size: 32, color: 'var(--color-additional-light)' }
    );
    setOffer(_offer);
  }, [setOffer, info]);

  const onAuctionClosed = useCallback((_offer: Offer) => {
    if (offer.auction?.bids?.length) {
      const topBid = offer.auction.bids.reduce((top, bid) => {
        return new BN(top.balance).gt(new BN(bid.balance)) ? top : bid;
      });

      onClose(topBid.bidderAddress);
    } else {
      onClose(_offer.seller);
    }
  }, [onClose, offer.auction?.bids]);

  useOfferSubscription({ offer, onPlaceBid, onAuctionStopped, onAuctionClosed });

  const price = offer.price;

  return (<>
    <Text size={'l'} testid={`${testid}-bid-title`}>{topBid ? 'Next minimum bid' : 'Starting bid'}</Text>
    <PriceForAuction price={price}
      minStep={offer.auction?.priceStep}
      topBid={topBid?.balance !== '0' ? topBid?.balance : topBid?.amount}
      testid={`${testid}-bid`}
    />
    <AuctionWrapper>
      {offer.auction?.status === 'active' && <ButtonsWrapper>
        {canDelist && <Button title={'Delist'}
          role={'danger'}
          onClick={onDelistAuctionClick}
          testid={`${testid}-delist-button`}
        />}
        {canPlaceABid && <PlaceABidButton title={'Place a bid'}
          role={'primary'}
          onClick={onPlaceABidClick}
          disabled={!canPlaceABid}
          testid={`${testid}-place-bid-button`}
        />}
        {canWithdraw && <Button
          title={'Withdraw'}
          onClick={onWithdrawClick}
          testid={`${testid}-withdraw-button`}
        />}
      </ButtonsWrapper>}
      {offer.tokenDescription.nestingChildTokens?.length && <BuyBundleInformation testid={testid}/>}
      {offer.auction?.status === 'active' && offer?.auction?.stopAt && <TimerWrapper>
        <Timer time={offer.auction.stopAt} testid={`${testid}-timer`} />
      </TimerWrapper>}
      {(offer.auction?.status === 'stopped' || offer.auction?.status === 'withdrawing') &&
      <Text>Auction is stopped</Text>}
      <Divider />
      <Heading size={'4'}>Offers</Heading>
      {isTopBidder && <TopBidderTextStyled testid={`${testid}-you-are-top-bidder-text`}>You are Top Bidder</TopBidderTextStyled>}
      {!isBidder && topBid && <LeadingBidWrapper>
        <Text color={'grey-500'} testid={`${testid}-highest-bidder-text`}>Highest Bidder</Text><AccountLink accountAddress={topBid?.bidderAddress || ''} testid={`${testid}-highest-bidder-address`}/>
      </LeadingBidWrapper>}
      {!isTopBidder && isBidder && <BidderStatusWrapper>
        <BidderTextStyled testid={`${testid}-you-are-outbid-text`}>You are outbid</BidderTextStyled>
        <LeadingBidWrapper>
          <Text color={'grey-500'} testid={`${testid}-leading-bid-text`}>Leading bid</Text><AccountLink accountAddress={topBid?.bidderAddress || ''} testid={`${testid}-leading-bid-address`}/>
        </LeadingBidWrapper>
      </BidderStatusWrapper>}
      <Bids offer={offer} testid={`${testid}-bids`} />
    </AuctionWrapper>
  </>);
};

export default Auction;

const AuctionWrapper = styled.div`
  margin-top: 24px;
`;

const TimerWrapper = styled.div`
  margin-top: 24px;
`;

const BidderStatusWrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: var(--gap);
  @media (max-width: 320px) {
    flex-direction: column;
    row-gap: calc(var(--gap) / 2);
    align-items: flex-start;
  }
`;

const ButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: var(--gap);
  @media (max-width: 320px) {
    flex-direction: column;
    row-gap: calc(var(--gap) / 2);
    & button {
      width: 100%;
    }
  }
`;

const Divider = styled.div`
  margin: 24px 0;
  border-top: 1px dashed ${Grey300};
`;

const TopBidderTextStyled = styled(Text)`
  margin-top: calc(var(--gap) / 2);
  box-sizing: border-box;
  display: block !important;
  padding: 8px 16px;
  margin-bottom: 24px;
  border-radius: 4px;
  background-color: ${AdditionalPositive100};
  color: ${AdditionalPositive500} !important;
  width: fit-content;
`;

const BidderTextStyled = styled(Text)`  
  margin-top: calc(var(--gap) / 2);
  box-sizing: border-box;
  display: flex;
  padding: 8px 16px;
  margin-bottom: 24px;
  border-radius: 4px;
  background-color: ${Coral100};
  color: ${Coral500} !important;
  width: fit-content;
  @media (max-width: 320px) {
    margin-bottom: 0;
  }
`;

const LeadingBidWrapper = styled.div`
  margin-bottom: calc(var(--gap) * 1.5);
  display: flex;
  align-items: center;
  column-gap: calc(var(--gap) / 2);
  a {
    font-size: 16px;
  }
`;

const PlaceABidButton = styled(Button)`
  width: 200px;
  @media (max-width: 320px) {
    width: 140px;
  }
`;
