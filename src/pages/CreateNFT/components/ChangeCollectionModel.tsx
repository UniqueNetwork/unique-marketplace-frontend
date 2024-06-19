import styled from 'styled-components';

import { Button, Modal, Text, Heading } from 'components/UI';
import { ModalFooter } from './ModalFooter';

type RemovingModalProps = {
  isVisible?: boolean;
  onSubmit(): void;
  onClose(): void;
};

export const ChangeCollectionModal = ({
  isVisible = true,
  onSubmit,
  onClose
}: RemovingModalProps) => {
  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <Heading>Changing collection</Heading>
      <ModalContent>
        <Text>
          When changing the collection, the attribute values will be cleared. Are you
          sure?
        </Text>
      </ModalContent>
      <ModalFooter>
        <Button role='outlined' title='Cancel' onClick={onClose} />
        <Button role='primary' title='Submit' onClick={onSubmit} />
      </ModalFooter>
    </Modal>
  );
};

export const ModalContent = styled.div`
  margin-bottom: var(--prop-gap);
`;
