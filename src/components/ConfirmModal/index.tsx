import { Button, Heading, Modal } from '@unique-nft/ui-kit';
import React, { FC, useCallback } from 'react';
import styled from 'styled-components';
import { AdditionalDark } from 'styles/colors';

export interface IConfirmModalProps {
  isVisible: boolean
  headerText?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isClosable?: boolean
  testid?: string
}

const ConfirmModal: FC<IConfirmModalProps> = ({
  isVisible,
  children,
  headerText = '',
  confirmText = 'Ok',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isClosable = false,
  testid
}) => {
  const onConfirmClick = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  return (
    <Modal isVisible={isVisible} onClose={onCancel} isClosable={isClosable}>
      {headerText && <Heading size='2'>{headerText}</Heading>}
      <Content>
        {children}
      </Content>
      <Footer>
        <Button
          // @ts-ignore
          testid={`${testid}-cancel-button`}
          onClick={onCancel}
          role='outlined'
          title={cancelText}
        />
        <Button
          // @ts-ignore
          testid={`${testid}-confirm-button`}
          onClick={onConfirmClick}
          role='primary'
          title={confirmText}
        />
      </Footer>
    </Modal>
  );
};

const Content = styled.div`
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: ${AdditionalDark};
  margin-bottom: 32px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export default ConfirmModal;
