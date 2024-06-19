import { ReactNode, VFC } from 'react';
import { Button, ButtonProps } from '../Button/Button';
import { Modal } from '../Modal';
import { Heading } from '../Heading/Heading';
import styled from 'styled-components';

interface IConfirmProps {
  children?: ReactNode;
  isClosable?: boolean;
  isVisible?: boolean;
  title?: string;
  buttons?: ButtonProps[];
  onClose(): void;
}

export const Confirm: VFC<IConfirmProps> = ({
  buttons,
  children,
  isClosable,
  isVisible = false,
  title = '',
  onClose
}) => {
  return (
    <Modal
      isClosable={isClosable}
      isVisible={isVisible}
      onClose={onClose}
    >
      {title && <Heading>{title}</Heading>}
      {children}
      {buttons && <ButtonsWrapper>
        {buttons?.map((btn, i) => (
          <Button key={i} {...btn} />
        ))}
      </ButtonsWrapper>}
    </Modal>
  );
};

const ButtonsWrapper = styled.div`
  display: flex;
  gap: var(--prop-gap);
  margin-top: var(--prop-gap);
`;
