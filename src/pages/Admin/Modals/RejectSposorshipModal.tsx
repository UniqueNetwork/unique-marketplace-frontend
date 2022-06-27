import React, { FC, useCallback, useState } from 'react';
import { Button, Heading, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { TAdminPanelModalBodyProps } from './AdminPanelModal';
import StagesModal from '../../Token/Modals/StagesModal';
import { useRejectSponsorshipStages } from '../../../hooks/adminStages/useRejectSponsorshipStages';

export const RejectSponsorshipModal: FC<TAdminPanelModalBodyProps> = ({ collection, onFinish, setIsClosable }) => {
  const [step, setStep] = useState<'ask' | 'stages'>('ask');
  const { initiate, status, stages } = useRejectSponsorshipStages(collection?.id || 0);

  const onConfirmClick = useCallback(() => {
    setIsClosable(false);
    setStep('stages');
    initiate(null);
  }, []);

  if (!collection) return null;

  if (step === 'stages') return (<StagesModal stages={stages} status={status} onFinish={onFinish} />);

  return (
    <>
      <Content>
        <Heading size='2'>Reject sponsorship</Heading>
      </Content>
      <Row>
        <Text size={'m'}>{`Are you sure you want to reject the sponsorship request from the ${collection?.name || collection.collectionName} [ID ${collection.id}] collection?`}</Text>
      </Row>
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

const Row = styled.div`
  margin: calc(var(--gap) * 1.5) 0;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;
