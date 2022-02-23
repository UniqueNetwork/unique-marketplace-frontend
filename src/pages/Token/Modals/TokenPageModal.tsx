import React, { FC, useEffect, useMemo, useState } from 'react';
import { Modal } from '@unique-nft/ui-kit';
import { Offer } from '../../../api/restApi/offers/types';
import { MarketType } from '../../../types/MarketTypes';
import { SellModal } from './SellModal';

export type TTokenPageModalProps = {
  onFinish: () => void;
  offer: Offer;
  // once button is clicked (sell/bid/etc) -> we will change marketType for modal and therefore this component decides what to show and how
  marketType: MarketType
}

export type TTokenPageModalBodyProps = {
  setIsClosable: (value: boolean) => void;
  offer: Offer;
  onFinish: () => void; // TODO: make a type, in future we would definitly wan't to pass smth like success/error/error.message
}

const TokenPageModal = ({ onFinish, marketType, offer }: TTokenPageModalProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isClosable, setIsClosable] = useState<boolean>(true);

  useEffect(() => {
    if (marketType === MarketType.default) setIsVisible(false);
    else setIsVisible(true);
  }, [marketType]);

  const ModalBodyComponent = useMemo<FC<TTokenPageModalBodyProps>>(() => {
    switch (marketType) {
      case MarketType.sellFix: // TODO: consider merdgin into one "sell" type?
      case MarketType.sellAuction:
        return SellModal;
      case MarketType.bid:
      case MarketType.delist:
      case MarketType.purchase:
      case MarketType.transfer:
      case MarketType.default:
      default:
        throw new Error('Not implemented');
    }
  }, [marketType]);

  return (
    <Modal isVisible={isVisible} isClosable={isClosable}>
      <ModalBodyComponent
        setIsClosable={setIsClosable}
        offer={offer}
        onFinish={onFinish}
      />
    </Modal>
  );
};

export default TokenPageModal;
