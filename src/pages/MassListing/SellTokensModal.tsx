import React, { FC, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Modal, useNotifications } from 'components/UI';
import { StageStatus } from 'types/StagesTypes';
import { TokenWithPrice } from './NFTLine';
import { useSellBulkStages } from './hooks/useSellBulkStages';
import DefaultMarketStages from 'pages/Token/Modals/StagesModal';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

export type SellTokensModalProps = {
  isVisible: boolean;
  tokensForListing: TokenWithPrice[];
  onFinish(): void;
  closeModal(): void;
  testid: string;
};

export const SellTokensModal: FC<SellTokensModalProps> = ({ isVisible, tokensForListing, onFinish, closeModal, testid }) => {
  const tokensForOrders = useMemo(() => {
    return tokensForListing.filter(token => !token.isSelected).map(token => ({
      ...token,
      amount: 1,
      currency: 0,
    }));
  }, [tokensForListing]);
  
  const { stages, status, initiate } = useSellBulkStages(tokensForOrders);
  const { info } = useNotifications();
  const [isInitiated, setIsInitiated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isVisible && !isInitiated) {
      initiate(null);
      setIsInitiated(true);
    }
  }, [isVisible, isInitiated]);

  useEffect(() => {
    if (status === StageStatus.success) {
      info('Sell process completed successfully', {
        name: 'success',
        size: 32,
        color: 'var(--color-additional-light)',
      });
      onFinish();
    }
  }, [status]);

  return (
    <Modal isVisible={isVisible} isClosable={false}>
      <div>
        <DefaultMarketStages
          stages={stages}
          status={status}
          onFinish={onFinish}
          testid={`${testid}`}
        />
      </div>

      {status === StageStatus.error && (
        <>
          <AlertStyled type='warning'>Sell stage failed.</AlertStyled>
          <ButtonsWrapper>
            <Button title='Close' role='primary' onClick={closeModal} />
          </ButtonsWrapper>
        </>
      )}
      {status === StageStatus.success && (
        <ButtonsWrapper>
          <Button title='To main page' onClick={() => {
            navigate('/market');
          }} />
        </ButtonsWrapper>
      )}
    </Modal>
  );
};


const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: calc(var(--prop-gap) * 2);
  gap: calc(var(--prop-gap) * 2);
`;

const AlertStyled = styled(Alert)`
  margin-top: calc(var(--prop-gap) * 1.5);
  margin-bottom: 8px !important;
`;
