import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Text, Button, Heading } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import BN from 'bn.js';

import { Offer } from '../../../api/restApi/offers/types';
import { NFTToken } from '../../../api/chainApi/unique/types';
import { AdditionalPositive100, AdditionalPositive500, Coral100, Coral500, Grey300 } from '../../../styles/colors';
import { useOfferSubscription } from '../../../hooks/useOfferSubscription';
import { useAccounts } from '../../../hooks/useAccounts';
import { compareEncodedAddresses, isTokenOwner } from '../../../api/chainApi/utils/addressUtils';
import { PriceForAuction } from '../TokenDetail/PriceForAuction';
import { useAuction } from '../../../api/restApi/auction/auction';
import { TCalculatedBid } from '../../../api/restApi/auction/types';
import Bids from './Bids';
import Timer from '../../../components/Timer';
import { useNotification } from '../../../hooks/useNotification';
import { NotificationSeverity } from '../../../notification/NotificationContext';
import AccountLink from '../../../components/Account/AccountLink';

interface AuctionProps {
  offer: Offer
  onPlaceABidClick(): void
  onDelistAuctionClick(): void
  onWithdrawClick(): void
  onClose(newOwnerAddress: string): void
}

const Auction: FC<AuctionProps> = ({ offer: initialOffer, onPlaceABidClick, onDelistAuctionClick, onWithdrawClick, onClose }) => {
  const [offer, setOffer] = useState<Offer>(initialOffer);
  const { selectedAccount } = useAccounts();
  const { getCalculatedBid } = useAuction();
  const { push } = useNotification();

  const [calculatedBid, setCalculatedBid] = useState<TCalculatedBid>();

  const fetchCalculatedBid = useCallback(async () => {
    const _calculatedBid = await getCalculatedBid({
      collectionId: offer?.collectionId || 0,
      tokenId: offer?.tokenId || 0,
      bidderAddress: selectedAccount?.address || ''
    });
    setCalculatedBid(_calculatedBid);
  }, [offer?.collectionId, offer?.tokenId, selectedAccount?.address]);

  useEffect(() => {
    if (!offer || offer.auction?.status !== 'active' || !selectedAccount) return;
    void fetchCalculatedBid();
  }, [fetchCalculatedBid]);

  const canPlaceABid = useMemo(() => {
    if (!selectedAccount?.address || !offer?.seller) return false;
    return !isTokenOwner(selectedAccount.address, { Substrate: offer.seller });
  }, [offer, selectedAccount?.address]);

  const canDelist = useMemo(() => {
    if (!selectedAccount?.address || !offer?.seller) return false;
    return isTokenOwner(selectedAccount.address, { Substrate: offer.seller }) && !offer.auction?.bids?.length;
  }, [offer, selectedAccount?.address]);

  const isBidder = useMemo(() => {
    if (!selectedAccount || !calculatedBid) return false;
    return offer.auction?.bids?.some((bid) => compareEncodedAddresses(
      bid.bidderAddress,
      selectedAccount.address
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
    return compareEncodedAddresses(topBid.bidderAddress, selectedAccount.address);
  }, [isBidder, topBid, selectedAccount]);

  const canWithdraw = useMemo(() => {
    if (!selectedAccount) return false;
    return isBidder && !isTopBidder;
  }, [isBidder, isTopBidder, selectedAccount]);

  const onPlaceBid = useCallback((_offer: Offer) => {
    setOffer(_offer);
  }, [setOffer]);

  const onAuctionStopped = useCallback((_offer: Offer) => {
    push({
      severity: NotificationSeverity.success,
      message: 'Auction is stopped'
    });
    setOffer(_offer);
  }, [setOffer, push]);

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
    <Text size={'l'}>{topBid ? 'Next minimum bid' : 'Starting bid'}</Text>
    <PriceForAuction price={price}
      minStep={offer.auction?.priceStep}
      topBid={topBid?.balance !== '0' ? topBid?.balance : topBid?.amount}
    />
    <AuctionWrapper>
      {offer.auction?.status === 'active' && <Row>
        {canDelist && <Button title={'Delist'}
          role={'danger'}
          onClick={onDelistAuctionClick}
        />}
        {canPlaceABid && <Button title={'Place a bid'}
          role={'primary'}
          onClick={onPlaceABidClick}
          disabled={!canPlaceABid}
        />}
        {canWithdraw && <Button title={'Withdraw'} onClick={onWithdrawClick} />}
      </Row>}
      {offer.auction?.status === 'active' && offer?.auction?.stopAt && <TimerWrapper>
        <Timer time={offer.auction.stopAt} />
      </TimerWrapper>}
      {(offer.auction?.status === 'stopped' || offer.auction?.status === 'withdrawing') &&
      <Text>Auction is stopped</Text>}
      <Divider />
      <Heading size={'4'}>Offers</Heading>
      {isTopBidder && <TopBidderTextStyled >You are Top Bidder</TopBidderTextStyled>}
      {!isTopBidder && isBidder && <Row>
        <BidderTextStyled >You are outbid</BidderTextStyled>
        <LeadingBidWrapper>
          <Text>{'Leading bid'}</Text><AccountLink accountAddress={topBid?.bidderAddress || ''} />
        </LeadingBidWrapper>
      </Row>}
      <Bids offer={offer} />
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

const Row = styled.div`
  display: flex;
  align-items: center;
  column-gap: var(--gap)
`;

const Divider = styled.div`
  margin: 24px 0;
  border-top: 1px dashed ${Grey300};
`;

const TopBidderTextStyled = styled(Text)`
  margin-top: calc(var(--gap) / 2);
  box-sizing: border-box;
  display: flex;
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
`;

const LeadingBidWrapper = styled.div`
  margin-bottom: var(--gap);
  display: flex;
  align-items: center;
  column-gap: calc(var(--gap) / 2);
`;
