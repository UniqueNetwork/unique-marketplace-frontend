import { Alert, Loader, Heading } from 'components/UI';
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
      <StageWrap innerItems={descriptions.length}>
        {descriptions.map((description, index) => (
          <Loader
            key={description}
            label={description}
            state={index === step ? 'process' : index > step ? 'idle' : 'done'}
          />
        ))}
      </StageWrap>
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

const StageWrap = styled.div<{innerItems?: number}>`
  display: flex;
  flex-direction: column;
  height: ${({innerItems}) => innerItems ? innerItems * 30 + 'px' : 'auto'};
  justify-content: space-between;
`;
