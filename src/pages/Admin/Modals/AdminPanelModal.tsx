import React, { FC, useEffect, useMemo, useState } from 'react';
import { Modal } from '@unique-nft/ui-kit';
import { AdminPanelModalType } from './types';
import { RejectSponsorshipModal } from './RejectSposorshipModal';
import { RemoveCollectionModal } from './RemoveCollectionModal';
import { AcceptSponsorshipModal } from './AcceptSponsorshipModal';
import { AddCollectionModal } from './AddCollectionModal';
import { SelectNFTsModal } from './SelectNFTsModal';
import { CollectionData } from '../../../api/restApi/admin/types';

export type TAdminPanelModalProps = {
  collection?: CollectionData
  modalType: AdminPanelModalType
  onClose(): void
  onFinish(): void
}
export type TAdminPanelModalBodyProps = {
  collection?: CollectionData
  setIsClosable(value: boolean): void
  onClose(): void
  onFinish(): void
}

export const AdminPanelModal = ({ onClose, onFinish, collection, modalType }: TAdminPanelModalProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isClosable, setIsClosable] = useState<boolean>(true);

  useEffect(() => {
    if (modalType === AdminPanelModalType.default) setIsVisible(false);
    else setIsVisible(true);
  }, [modalType]);

  const ModalBodyComponent = useMemo<FC<TAdminPanelModalBodyProps> | null>(() => {
    switch (modalType) {
      case AdminPanelModalType.addCollection:
        return AddCollectionModal;
      case AdminPanelModalType.removeCollection:
        return RemoveCollectionModal;
      case AdminPanelModalType.acceptSponsorship:
        return AcceptSponsorshipModal;
      case AdminPanelModalType.rejectSponsorship:
        return RejectSponsorshipModal;
      case AdminPanelModalType.selectNFTs:
        return SelectNFTsModal;
      case AdminPanelModalType.default:
      default:
        return null;
    }
  }, [modalType]);

  if (!ModalBodyComponent) return null;

  return (
    <Modal isVisible={isVisible} isClosable={isClosable} onClose={onClose}>
      <ModalBodyComponent
        collection={collection}
        onFinish={onFinish}
        onClose={onClose}
        setIsClosable={setIsClosable}
      />
    </Modal>
  );
};
