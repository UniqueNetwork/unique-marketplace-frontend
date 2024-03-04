import { ReactNode } from 'react';
import styled from 'styled-components';

import { Modal, ModalProps } from 'components/UI/Modal';
import { Alert, Loader } from 'components/UI';
import { Heading } from '@unique-nft/ui-kit';

type Props = Pick<ModalProps, 'isVisible'> & {
  description: string;
  isVisible: boolean;
  title?: string;
  warning?: ReactNode;
};

export const StatusTransactionModal = ({
  description,
  title = 'Please wait',
  isVisible,
  warning
}: Props) => {
  return (
    <Modal isVisible={isVisible} isClosable={false}>
      <Heading>{title}</Heading>
      <Loader label={description} />
      {!!warning && <AlertStyled type='warning'>{warning}</AlertStyled>}
    </Modal>
  );
};

const AlertStyled = styled(Alert)`
  margin-top: calc(var(--prop-gap) * 1.5);
  margin-bottom: 0 !important;
`;
