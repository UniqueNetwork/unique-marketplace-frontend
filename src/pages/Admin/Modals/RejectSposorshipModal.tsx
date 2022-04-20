import React, { FC, useCallback } from 'react';
import { Button, Heading, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { TAdminPanelModalBodyProps } from './AdminPanelModal';

export const RejectSponsorshipModal: FC<TAdminPanelModalBodyProps> = ({ collection, onClose }) => {
  const onConfirmClick = useCallback(() => {
    onClose();
  }, []);

  return (
    <>
      <Content>
        <Heading size='2'>Reject sponsorship</Heading>
      </Content>
      <Text size={'m'}>Are you sure you want to reject the sponsorship request from the &quot;name&quot; collection?</Text>
      <ButtonWrapper>
        <Button
          onClick={onConfirmClick}
          role='primary'
          title='Confirm'
        />
      </ButtonWrapper>
    </>
  );
};

const Content = styled.div`
  && h2 {
    margin-bottom: 0;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;
