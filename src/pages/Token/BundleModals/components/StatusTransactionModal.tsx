import { Alert, Heading, Loader, Text } from '@unique-nft/ui-kit';
import { FeeMessage } from 'components';
import { Button, Icon } from 'components/UI';
import { Modal, ModalProps } from 'components/UI/Modal';
import { ReactNode } from 'react';
import styled from 'styled-components';

type Props = Pick<ModalProps, 'isVisible'> & {
  total: number;
  progress: number;
  isVisible: boolean;
  title?: string;
  stage: 'transferring' | 'done';
  warning?: ReactNode;
  fee?: string;
  onComplete(): void;
  onContinue(): void;
};

export const StatusTransactionModal = ({
  title = 'Please wait',
  total,
  progress,
  isVisible,
  stage,
  fee,
  onComplete,
  onContinue
}: Props) => {
  return (
    <Modal isVisible={isVisible} isClosable={false}>
      <Heading>{title}</Heading>
      <StagesWrapper>
        {stage === 'transferring' ? <Loader /> : <Icon name={'check-circle'} size={24} color={'var(--color-additional-dark)'} />}
        <StageDescription>
          <Text size='m' weight='regular'>{`Transferring ${
              progress
            } of ${total} tokens`}</Text>
        </StageDescription>
      </StagesWrapper>
      <FeeMessage isFeeLoading={false} fee={fee || ''} testid={''}/>
      {stage === 'done' && (
        <ButtonsWrapper>
          <Button title='Go to token' onClick={onComplete} />
        </ButtonsWrapper>
      )}
    </Modal>
  );
};

const StagesWrapper = styled.div`
  display: grid;
  grid-template-columns: 24px 1fr;
  align-items: flex-start;
  grid-column-gap: var(--gap);
  grid-row-gap: var(--gap);
  align-items: center;
`;

const StageDescription = styled.div`
  display: flex;
  flex-direction: column;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: calc(var(--gap) * 2);
  gap: calc(var(--gap) * 2);
`;

const AlertStyled = styled(Alert)`
  margin-top: calc(var(--prop-gap) * 1.5);
  margin-bottom: 8px !important;
`;
