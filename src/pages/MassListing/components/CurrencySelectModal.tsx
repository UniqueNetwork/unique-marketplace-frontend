import React, { useState } from 'react';
import { Modal, Button } from 'components/UI';
import styled from 'styled-components';
import { CurrencySelect } from './CurrencySelect';

type CurrencySelectModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (currency: number) => void;
};

export const CurrencySelectModal = ({ isVisible, onClose, onSubmit }: CurrencySelectModalProps) => {
  const [selectedCurrency, setSelectedCurrency] = useState<number>(0);

  const handleSubmit = () => {
    onSubmit(selectedCurrency);
    onClose();
  };

  return (
    <Modal isFlexible={true} isVisible={isVisible} onClose={onClose}>
      <ModalContent>
        <h3>Set Currency for Selected Tokens</h3>
        <CurrencySelect
          selectedCurrency={selectedCurrency}
          onCurrencyChange={setSelectedCurrency}
          tokenId={123}
        />
        <ButtonWrapper>
          <Button title="Cancel" onClick={onClose} />
          <Button title="Apply" onClick={handleSubmit} role='primary' />
        </ButtonWrapper>
      </ModalContent>
    </Modal>
  );
};

const ModalContent = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;