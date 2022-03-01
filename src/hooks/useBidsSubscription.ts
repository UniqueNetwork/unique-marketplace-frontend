import { useContext, useEffect } from 'react';

import { Bid, Offer } from '../api/restApi/offers/types';
import AuctionContextContext from '../api/restApi/auction/AuctionContext';

type useBidsSubscriptionProps = {
  offer: Offer,
  onPlaceBid(offer: Offer): void
};

export const useBidsSubscription = ({ offer, onPlaceBid }: useBidsSubscriptionProps) => {
  const { socket } = useContext(AuctionContextContext);

  useEffect(() => {
    if (!offer || !socket) return;
    socket?.emit('subscribeToAuction', {
      collectionId: offer.collectionId,
      tokenId: offer.tokenId
    });

    socket?.on('bidPlaced', (offer) => {
      console.log('bidPlaced', offer);
      onPlaceBid(offer);
    });

    return () => {
      socket?.emit('unsubscribeToAuction', offer);
    };
  }, [socket, offer]);

  return {};
};
