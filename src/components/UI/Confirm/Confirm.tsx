import { ReactNode, VFC } from 'react';
import { Button, ButtonProps } from '../Button/Button';
import { Modal } from '../Modal';
import { Heading } from '@unique-nft/ui-kit';

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
      {buttons && <div>
        {buttons?.map((btn, i) => (
          <Button key={i} {...btn} />
        ))}
      </div>}
    </Modal>
  );
};
