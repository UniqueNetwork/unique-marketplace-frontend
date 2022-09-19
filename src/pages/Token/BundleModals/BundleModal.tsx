import React, { FC, useEffect, useMemo, useState } from 'react';
import { Modal } from '@unique-nft/ui-kit';

import { BundleModalType } from './types';
import { UnnestModal } from './UnnestModal';
import { TransferToBundleModal } from './TransferToBundleModal';
import { INestingToken } from 'components/BundleTree/types';

export type TBundleModalProps = {
  token?: INestingToken
  parent?: INestingToken
  bundleModalType: BundleModalType
  onClose(): void
  onFinish(): void
  testid: string
}

export type TBundleModalBodyProps = {
  token: INestingToken
  parent: INestingToken
  onFinish(): void
  setIsClosable(value: boolean): void
  testid: string
}

const BundleModal = ({ token, parent, onClose, onFinish, bundleModalType, testid }: TBundleModalProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isClosable, setIsClosable] = useState<boolean>(true);

  useEffect(() => {
    if (bundleModalType === BundleModalType.default) setIsVisible(false);
    else setIsVisible(true);
  }, [bundleModalType]);

  const ModalBodyComponent = useMemo<FC<TBundleModalBodyProps> | null>(() => {
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
    <Modal isVisible={isVisible} isClosable={isClosable} onClose={onClose}>
      <ModalBodyComponent
        setIsClosable={setIsClosable}
        onFinish={onFinish}
        testid={`${testid}-${bundleModalType.toLowerCase().replaceAll(' ', '-')}-modal`}
        token={token}
        parent={parent}
      />
    </Modal>
  );
};

export default BundleModal;
