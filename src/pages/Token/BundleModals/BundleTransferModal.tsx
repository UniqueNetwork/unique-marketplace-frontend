import React, { FCC, useEffect, useMemo, useState } from 'react';
import { TokenWithInfoV2Dto } from '@unique-nft/sdk';
import { UnnestModal } from './UnnestModal';
import { TransferToBundleModal } from './TransferToBundleModal';
import { CustomizeModal } from './CustomizeModal';
import { INestingToken } from 'components/BundleTree/types';
import { Modal } from 'components/UI';
import { EquipModal } from './EquipModal';
import { MarketType } from 'types/MarketTypes';
import { UnequipModal } from './UnequipModal';

export type TBundleTransferModalProps = {
  token?: INestingToken | TokenWithInfoV2Dto
  bundleModalType: MarketType
  setModalType(type: MarketType): void
  onClose(): void
  onFinish(): void
  testid: string
}

export type TBundleTransferModalBodyProps = {
  token: INestingToken | TokenWithInfoV2Dto
  onFinish(): void
  setIsClosable(value: boolean): void
  testid: string
}

const BundleTransferModal = ({ token, onClose, onFinish, bundleModalType, setModalType, testid }: TBundleTransferModalProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isClosable, setIsClosable] = useState<boolean>(true);

  useEffect(() => {
    if (bundleModalType === MarketType.default) {
      setIsVisible(false);
      setIsClosable(true);
    } else setIsVisible(true);
  }, [bundleModalType]);

  const ModalBodyComponent = useMemo<FCC<TBundleTransferModalBodyProps> | null>(() => {
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
      onClose={onFinish}
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

export default BundleTransferModal;
