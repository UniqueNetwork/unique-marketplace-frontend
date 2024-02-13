import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { UnnestModal } from './UnnestModal';
import { TransferToBundleModal } from './TransferToBundleModal';
import { CustomizeModal } from './CustomizeModal';
import { INestingToken } from 'components/BundleTree/types';
import { Modal } from 'components/UI';
import { TokenByIdResponse } from '@unique-nft/sdk';
import { EquipModal } from './EquipModal';
import { MarketType } from 'types/MarketTypes';
import { UnequipModal } from './UnequipModal';

export type TBundleTrunsferModalProps = {
  token?: INestingToken | TokenByIdResponse
  bundleModalType: MarketType
  setModalType(type: MarketType): void
  onClose(): void
  onFinish(): void
  testid: string
}

export type TBundleTransferModalBodyProps = {
  token: INestingToken | TokenByIdResponse
  onFinish(): void
  setIsClosable(value: boolean): void
  testid: string
}

const BundleTrunsferModal = ({ token, onClose, onFinish, bundleModalType, setModalType, testid }: TBundleTrunsferModalProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isClosable, setIsClosable] = useState<boolean>(true);

  useEffect(() => {
    if (bundleModalType === MarketType.default) {
      setIsVisible(false);
      setIsClosable(true);
    } else setIsVisible(true);
  }, [bundleModalType]);

  const ModalBodyComponent = useMemo<FC<TBundleTransferModalBodyProps> | null>(() => {
    switch (bundleModalType) {
      case MarketType.unnest:
        return UnnestModal;
      case MarketType.nestedTransfer:
        return TransferToBundleModal;
      case MarketType.createBundle:
        return CustomizeModal;
      case MarketType.equipWearable:
        return EquipModal;
      case MarketType.unequipWearable:
        return UnequipModal;
      case MarketType.default:
      default:
        return null;
    }
  }, [bundleModalType]);

  if (!ModalBodyComponent || !token) return null;

  return (
    <Modal
      isVisible={isVisible}
      isClosable={isClosable}
      onClose={onClose}
      isGlobalBackdrop
      isFlexible
    >
      <ModalBodyComponent
        setIsClosable={setIsClosable}
        onFinish={onFinish}
        testid={`${testid}-${bundleModalType.toLowerCase().replaceAll(' ', '-')}-modal`}
        token={token}
      />
    </Modal>
  );
};

export default BundleTrunsferModal;
