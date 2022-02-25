import React, { FC, useEffect, useMemo, useState } from 'react';
import { Modal } from '@unique-nft/ui-kit';

import { Offer } from '../../../api/restApi/offers/types';
import { MarketType } from '../../../types/MarketTypes';
import { SellModal } from './SellModal';
import { NFTToken } from '../../../api/chainApi/unique/types';
import { CancelSellFixStagesModal } from './CancelSellModal';
import PurchaseModal from './PurchaseModal';
import { TransferModal } from './TransferModal';

export type TTokenPageModalProps = {
  onFinish: () => void
  offer?: Offer
  token: NFTToken
  // once button is clicked (sell/bid/etc) -> we will change marketType for modal and therefore this component decides what to show and how
  marketType: MarketType
}

export type TTokenPageModalBodyProps = {
  setIsClosable: (value: boolean) => void
  token: NFTToken
  offer?: Offer
  onFinish: () => void // TODO: make a type, in future we would definitly wan't to pass smth like success/error/error.message
}

const TokenPageModal = ({ onFinish, marketType, offer, token }: TTokenPageModalProps) => {
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
        throw new Error('Not implemented');
      case MarketType.delist:
        return CancelSellFixStagesModal;
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
    <Modal isVisible={isVisible} isClosable={isClosable} onClose={onFinish}>
      <ModalBodyComponent
        setIsClosable={setIsClosable}
        token={token}
        offer={offer}
        onFinish={onFinish}
      />
    </Modal>
  );
};

export default TokenPageModal;
