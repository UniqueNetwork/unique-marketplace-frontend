import React from 'react';
import Modal from 'react-modal';
import { ModalProps } from './types';

const PurchaseModal = ({ token, ...other }: ModalProps) => {
  return (
    <div>
      <Modal appElement={document.getElementById('root') as HTMLElement} {...other}>
        Modal
      </Modal>
    </div>);
};

export default PurchaseModal;
