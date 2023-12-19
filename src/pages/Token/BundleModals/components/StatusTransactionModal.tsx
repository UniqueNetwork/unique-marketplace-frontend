import { Alert, Heading, Loader, Text } from '@unique-nft/ui-kit';
import { Button, Icon } from 'components/UI';
import { Modal, ModalProps } from 'components/UI/Modal';
import { ReactNode } from 'react';
import styled from 'styled-components';

type Props = Pick<ModalProps, 'isVisible'> & {
  totalNesting: number;
  totalUnnesting: number;
  unnestingProgress: number;
  nestingProgress: number;
  isVisible: boolean;
  title?: string;
  stage: 'unnesting' | 'nesting' | 'done';
  warning?: ReactNode;
  onComplete(): void;
  onContinue(): void;
};

export const StatusTransactionModal = ({
  title = 'Please wait',
  totalNesting,
  totalUnnesting,
  unnestingProgress,
  nestingProgress,
  isVisible,
  stage,
  onComplete,
  onContinue
}: Props) => {
  return (
    <Modal isVisible={isVisible} isClosable={false}>
      <Heading>{title}</Heading>
      <StagesWrapper>
        {!!totalUnnesting && <>
          {stage === 'unnesting' ? <Loader /> : <Icon name={'check-circle'} size={24} color={'var(--color-additional-dark)'} />}
          <StageDescription>
            <Text size='m' weight='regular'>{`Unnesting ${
              unnestingProgress
            } of ${totalUnnesting} tokens`}</Text>
            <Text size='s' color='grey-500'>
              Step 1
            </Text>
          </StageDescription>
        </>}
        {!!totalNesting && <>
          {stage === 'nesting' ? <Loader /> : stage === 'done' ? <Icon name={'check-circle'} size={24} color={'var(--color-additional-dark)'} /> : <div></div>}
          <StageDescription>
            <Text size='m' weight='regular'>{`Nesting ${
              nestingProgress
            } of ${totalNesting} tokens`}</Text>
            <Text size='s' color='grey-500'>
              Step {totalUnnesting ? '2' : '1'}
            </Text>
          </StageDescription>
        </>}
      </StagesWrapper>
      {stage !== 'done' && (
        <AlertStyled type='warning'>
          Please do not close or refresh this page until the token nesting is completed.
        </AlertStyled>
      )}
      {stage === 'done' && (
        <ButtonsWrapper>
          <Button title='Customize more' role='primary' onClick={onContinue} />
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
