import styled from 'styled-components';

import { Button, Modal, Text, Heading } from 'components/UI';

import { NewToken } from '../types';
import { ModalFooter } from './ModalFooter';

type RemovingModalProps = {
  isVisible?: boolean;
  tokens: NewToken[];
  onSubmit(): void;
  onClose(): void;
};

export const RemovingModal = ({
  isVisible = true,
  tokens,
  onSubmit,
  onClose
}: RemovingModalProps) => {
  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <Heading>Removing</Heading>
      <ModalContent>
        <Text>{tokens.length} tokens will be removed. Are you sure?</Text>
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
