import React, { FC, useEffect, useMemo, useState } from 'react';
import { Modal } from '@unique-nft/ui-kit';

import { Offer } from '../../../api/restApi/offers/types';
import { MarketType } from '../../../types/MarketTypes';
import { SellModal } from './SellModal';
import { NFTToken } from '../../../api/chainApi/unique/types';
import { CancelSellFixStagesModal } from './CancelSellModal';
import PurchaseModal from './PurchaseModal';
import { TransferModal } from './TransferModal';
import { AuctionModal } from './AuctionModal';
import { WithdrawBidStagesModal } from './WithdrawBidModal';
import { CancelAuctionStagesModal } from './CancelAuctionModal';

export type TTokenPageModalProps = {
  offer?: Offer
  token?: NFTToken
  // once button is clicked (sell/bid/etc) -> we will change marketType for modal and therefore this component decides what to show and how
  marketType: MarketType
  onClose(): void
  onFinish(): void
  testid: string
}

export type TTokenPageModalBodyProps = {
  token?: NFTToken
  offer?: Offer
  onFinish(): void // TODO: make a type, in future we would definitly wan't to pass smth like success/error/error.message
  setIsClosable(value: boolean): void
  testid?: string
}

const TokenPageModal = ({ onClose, onFinish, marketType, offer, token, testid }: TTokenPageModalProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isClosable, setIsClosable] = useState<boolean>(true);

  useEffect(() => {
    if (marketType === MarketType.default) setIsVisible(false);
    else setIsVisible(true);
  }, [marketType]);

  const ModalBodyComponent = useMemo<FC<TTokenPageModalBodyProps> | null>(() => {
    switch (marketType) {
      case MarketType.sellFix: // TODO: consider merdgin into one "sell" type?
      case MarketType.sellAuction:
        return SellModal;
      case MarketType.bid:
        return AuctionModal;
      case MarketType.withdrawBid:
        return WithdrawBidStagesModal;
      case MarketType.delist:
        return CancelSellFixStagesModal;
      case MarketType.delistAuction:
        return CancelAuctionStagesModal;
      case MarketType.purchase:
        return PurchaseModal;
      case MarketType.transfer:
        return TransferModal;
      case MarketType.default:
      default:
        return null;
    }
  }, [marketType]);

  if (!ModalBodyComponent) return null;

  return (
    <Modal isVisible={isVisible} isClosable={isClosable} onClose={onClose}>
      <ModalBodyComponent
        setIsClosable={setIsClosable}
        token={token}
        offer={offer}
        onFinish={onFinish}
        testid={`${testid}-${marketType.toLowerCase().replaceAll(' ', '-')}-modal`}
      />
    </Modal>
  );
};

export default TokenPageModal;
