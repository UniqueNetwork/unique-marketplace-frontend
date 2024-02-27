import { Alert, Heading } from '@unique-nft/ui-kit';
import { Loader } from 'components/UI';
import { Modal, ModalProps } from 'components/UI/Modal';
import { ReactNode } from 'react';
import styled from 'styled-components';

type Props = Pick<ModalProps, 'isVisible'> & {
  descriptions: string[];
  isVisible: boolean;
  title?: string;
  warning?: ReactNode;
  step: number;
};

export const StatusCreateTransactionsModal = ({
  descriptions,
  title = 'Please wait',
  isVisible,
  warning,
  step
}: Props) => {
  return (
    <ModalStyled isVisible={isVisible} isClosable={false}>
      <Heading>{title}</Heading>
      {descriptions.map((description, index) => (
        <Loader
          key={description}
          label={description}
          state={index === step ? 'process' : index > step ? 'idle' : 'done'}
        />
      ))}
      {!!warning && <AlertStyled type='warning'>{warning}</AlertStyled>}
    </ModalStyled>
  );
};

const ModalStyled = styled(Modal)`
  display: flex;
  flex-direction: column;
  & > div {
    margin-bottom: calc(var(--prop-gap) * 1.5);
  }
`;

const AlertStyled = styled(Alert)`
  margin-bottom: 0 !important;
  margin-top: var(--prop-gap) !important;
`;
