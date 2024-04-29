import { Alert, Button, Loader, Text, Heading } from 'components/UI';
import { Modal, ModalProps } from 'components/UI/Modal';
import { ReactNode } from 'react';
import styled from 'styled-components';

export enum TRANSACTION_STAGE_ENUM {
  UPLOADING = 'uploading',
  MINTING = 'minting',
  DONE = 'done',
  FAILED = 'failed'
}

type Props = Pick<ModalProps, 'isVisible'> & {
  uploadingProgress?: number;
  mintingProgress?: number;
  totalTokens: number;
  batchSize: number;
  stage: TRANSACTION_STAGE_ENUM;
  isVisible: boolean;
  title?: string;
  warning?: ReactNode;
  onComplete(): void;
  onContinue(): void;
};

export const StatusTransactionModal = ({
  title = 'Please wait',
  stage,
  uploadingProgress = 0,
  mintingProgress = 0,
  totalTokens,
  batchSize,
  isVisible,
  onComplete,
  onContinue
}: Props) => {
  return (
    <Modal isVisible={isVisible} isClosable={false}>
      <Heading>{title}</Heading>
      <StagesWrapper>
        <Loader state={stage === 'uploading' ? 'process' : 'done'} />
        <StageDescription>
          <Text size='m' weight='regular'>{`Uploading ${
            uploadingProgress + 1
          } of ${totalTokens} files`}</Text>
          <Text size='s' color='grey-500'>
            Step 1
          </Text>
        </StageDescription>
        <Loader
          state={
            stage === TRANSACTION_STAGE_ENUM.UPLOADING
              ? 'idle'
              : stage === TRANSACTION_STAGE_ENUM.MINTING
              ? 'process'
              : stage === TRANSACTION_STAGE_ENUM.FAILED
              ? 'failed'
              : 'done'
          }
        />
        <StageDescription>
          <Text size='m' weight='regular'>{`Minting ${
            mintingProgress + 1
          }-${Math.min(
            mintingProgress + batchSize,
            totalTokens
          )} of ${totalTokens} tokens`}</Text>
          <Text size='s' color='grey-500'>
            Step 2
          </Text>
        </StageDescription>
      </StagesWrapper>
      {(stage === TRANSACTION_STAGE_ENUM.MINTING ||
        stage === TRANSACTION_STAGE_ENUM.UPLOADING) && (
        <AlertStyled type='warning'>
          Please do not close or refresh this page until the token minting is
          completed.
        </AlertStyled>
      )}
      {stage === TRANSACTION_STAGE_ENUM.FAILED && (
        <AlertStyled type='warning'>Minting failed.</AlertStyled>
      )}
      {stage === TRANSACTION_STAGE_ENUM.DONE && (
        <ButtonsWrapper>
          <Button title='Create more' role='primary' onClick={onContinue} />
          <Button title='Go to my tokens' onClick={onComplete} />
        </ButtonsWrapper>
      )}
    </Modal>
  );
};

const StagesWrapper = styled.div`
  display: grid;
  grid-template-columns: 24px 1fr;
  align-items: flex-start;
  grid-column-gap: var(--prop-gap);
  grid-row-gap: var(--prop-gap);
  align-items: center;
`;

const StageDescription = styled.div`
  display: flex;
  flex-direction: column;
`;

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
