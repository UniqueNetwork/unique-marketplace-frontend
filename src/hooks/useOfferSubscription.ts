import { useContext, useEffect, useRef } from 'react';

import { Offer } from '../api/restApi/offers/types';
import AuctionContext from '../api/restApi/auction/AuctionContext';

type useOfferSubscriptionProps = {
  offer: Offer,
  onPlaceBid(offer: Offer): void,
  onAuctionStopped?(offer: Offer): void
  onAuctionClosed?(offer: Offer): void
};

export const useOfferSubscription = ({ offer, onPlaceBid, onAuctionStopped, onAuctionClosed }: useOfferSubscriptionProps) => {
  const { socket } = useContext(AuctionContext);
  const offerRef = useRef<Offer>();

  useEffect(() => {
    if (!offer || !socket) return;
    if (offerRef.current !== offer) {
      socket?.emit('unsubscribeToAuction', offerRef.current);
      offerRef.current = offer;
    }
    socket?.emit('subscribeToAuction', {
      collectionId: offer.collectionId,
      tokenId: offer.tokenId
    });
    socket?.on('bidPlaced', (offer) => {
      onPlaceBid(offer);
    });

    socket?.on('auctionStopped', (offer) => {
      if (onAuctionStopped) {
        onAuctionStopped(offer);
      }
    });
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
