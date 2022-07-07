import React, { FC, useEffect, useMemo, useState } from 'react';
import { Modal } from '@unique-nft/ui-kit';
import { AdminPanelModalType } from './types';
import { RejectSponsorshipModal } from './RejectSposorshipModal';
import { RemoveCollectionModal } from './RemoveCollectionModal';
import { AcceptSponsorshipModal } from './AcceptSponsorshipModal';
import { AddCollectionModal } from './AddCollectionModal';
import { SelectNFTsModal } from './SelectNFTsModal';
import { CollectionData } from '../../../api/restApi/admin/types';
import styled from 'styled-components';

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
    if (modalType === AdminPanelModalType.default) {
      setIsVisible(false);
      setIsClosable(true);
    } else setIsVisible(true);
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
    <AdminModalWrapper>
      <Modal isVisible={isVisible} isClosable={isClosable} onClose={onClose}>
        <ModalBodyComponent
          collection={collection}
          onFinish={onFinish}
          onClose={onClose}
          setIsClosable={setIsClosable}
        />
      </Modal>
    </AdminModalWrapper>
  );
};

const AdminModalWrapper = styled.div`
  & .unique-modal-wrapper .unique-modal {
    overflow: initial;
  }
  @media (max-width: 767px) {
    & .unique-modal-wrapper .unique-modal {
      width: calc(520px - (var(--gap) * 3));
    }
  }

  @media (max-width: 567px) {
    & .unique-modal-wrapper .unique-modal {
      width: calc(304px - (var(--gap) * 3));
      padding: 24px 16px;
    }
  }
`;
