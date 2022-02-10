import { Modal } from '@unique-nft/ui-kit';
import React from 'react';
import { ModalProps } from './types';

const PurchaseModal = ({ token, ...other }: ModalProps) => {
  const price = 0.0001; // debug
  return (
    <div>
      <Modal isVisible={false} {...other}>
        tmp
      </Modal>
    </div>);
};

export default PurchaseModal;
