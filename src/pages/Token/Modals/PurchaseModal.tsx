import React from 'react';
import Modal from 'react-modal';
import NftDetails from '../tmp_purchase/NftDetails';
import { ModalProps } from './types';

const PurchaseModal = ({ token, ...other }: ModalProps) => {
  return (
    <div>
      <Modal appElement={document.getElementById('root') as HTMLElement} {...other}>
        <NftDetails account='5EALag5gFWyjbz9kYV5VNUr7tjg9MrAMg2nZhWwSmAHdaiZp' />
      </Modal>
    </div>);
};

export default PurchaseModal;
