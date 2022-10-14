import React, { FC, useEffect, useMemo, useState } from 'react';

import { BundleModalType } from './types';
import { UnnestModal } from './UnnestModal';
import { TransferToBundleModal } from './TransferToBundleModal';
import { INestingToken } from 'components/BundleTree/types';
import { Modal } from 'components/UI';

export type TBundleTrunsferModalProps = {
  token?: INestingToken
  bundleModalType: BundleModalType
  onClose(): void
  onFinish(): void
  testid: string
}

export type TBundleTrunsferModalBodyProps = {
  token: INestingToken
  onFinish(): void
  setIsClosable(value: boolean): void
  testid: string
}

const BundleTrunsferModal = ({ token, onClose, onFinish, bundleModalType, testid }: TBundleTrunsferModalProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isClosable, setIsClosable] = useState<boolean>(true);

  useEffect(() => {
    if (bundleModalType === BundleModalType.default) setIsVisible(false);
    else setIsVisible(true);
  }, [bundleModalType]);

  const ModalBodyComponent = useMemo<FC<TBundleTrunsferModalBodyProps> | null>(() => {
    switch (bundleModalType) {
      case BundleModalType.unnest:
        return UnnestModal;
      case BundleModalType.nestedTransfer:
        return TransferToBundleModal;
      case BundleModalType.default:
      default:
        return null;
    }
  }, [bundleModalType]);

  if (!ModalBodyComponent || !token || !parent) return null;

  return (
    <Modal isVisible={isVisible}
      isClosable={isClosable}
      onClose={onClose}
      isGlobalBackdrop
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
