import { useContext, useEffect } from 'react';

import { Bid, Offer } from '../api/restApi/offers/types';
import AuctionContextContext from '../api/restApi/auction/AuctionContext';

type useBidsSubscriptionProps = {
  offer: Offer,
  onPlaceBid(bid: Bid): void
};

export const useBidsSubscription = ({ offer, onPlaceBid }: useBidsSubscriptionProps) => {
  const { socket } = useContext(AuctionContextContext);

  useEffect(() => {
    if (!offer) return;
    socket?.emit('subscribeToAuction', offer);

    socket?.on('bidPlaced', (_data) => {
      console.log('bidPlaced', _data);
      // onPlaceBid
    });

    return () => {
      socket?.emit('unsubscribeToAuction', offer);
    };
  }, [socket, offer]);

  return {};
};
