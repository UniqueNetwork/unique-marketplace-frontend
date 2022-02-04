import React from 'react';
import Modal from 'react-modal';
import { ModalProps } from './types';

const PurchaseModal = ({ token, ...other }: ModalProps) => {
  const price = 0.0001; // debug
  return (
    <div>
      <Modal appElement={document.getElementById('root') as HTMLElement} {...other}>
        tmp
      </Modal>
    </div>);
};

export default PurchaseModal;
