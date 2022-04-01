import { useContext, useEffect, useRef } from 'react';

import { Offer } from '../api/restApi/offers/types';
import AuctionContext from '../api/restApi/auction/AuctionContext';

type useOfferSubscriptionProps = {
  offer: Offer,
  onPlaceBid(offer: Offer): void,
  onAuctionClosed?(offer: Offer): void
};

export const useOfferSubscription = ({ offer, onPlaceBid, onAuctionClosed }: useOfferSubscriptionProps) => {
  const { socket } = useContext(AuctionContext);
  const offerRef = useRef<Offer>();

  useEffect(() => {
    console.log('useOfferSubscription');
    if (!offer || !socket) return;
    if (offerRef.current !== offer) {
      socket?.emit('unsubscribeToAuction', offerRef.current);
      offerRef.current = offer;
    }
    socket?.emit('subscribeToAuction', {
      collectionId: offer.collectionId,
      tokenId: offer.tokenId
    });
    console.log('subscribe to bidPlaced');
    socket?.on('bidPlaced', (offer) => {
      onPlaceBid(offer);
    });
    console.log('subscribe to auctionClosed');
    socket?.on('auctionClosed', (offer) => {
      if (onAuctionClosed) {
        onAuctionClosed(offer);
      }
    });

    return () => {
      socket?.emit('unsubscribeToAuction', offer);
    };
  }, [socket, offer]);

  return {};
};
