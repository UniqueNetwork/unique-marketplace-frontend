import React, { FC, useCallback, useEffect, useState } from 'react';
import { Heading, Link } from '@unique-nft/ui-kit';
import { Text, useNotifications, Button } from 'components/UI';
import styled from 'styled-components';

import DefaultMarketStages from '../Modals/StagesModal';
import { useAccounts } from '../../../hooks/useAccounts';
import { StageStatus } from '../../../types/StagesTypes';
import { useUnnestStages } from '../../../hooks/marketplaceStages/useUnnestStages';
import { TBundleTrunsferModalBodyProps } from './BundleTrunsferModal';

export const UnnestModal: FC<TBundleTrunsferModalBodyProps> = ({ token, setIsClosable, onFinish, testid }) => {
  const { selectedAccount } = useAccounts();
  const [status, setStatus] = useState<'ask' | 'unnest-stage'>('ask'); // TODO: naming

  const onUnnest = useCallback(() => {
    setStatus('unnest-stage');
    setIsClosable(false);
  }, [setStatus, setIsClosable]);

  if (!selectedAccount || !token) return null;

  if (status === 'ask') return (<AskUnnestModal onUnnest={onUnnest} testid={`${testid}-ask-transfer`} />);
  if (status === 'unnest-stage') {
    return (<UnnestStagesModal
      onFinish={onFinish}
      token={token}
      setIsClosable={setIsClosable}
      testid={testid}
    />);
  }
  return null;
};

const AskUnnestModal: FC<{ onUnnest(): void, testid: string }> = ({ onUnnest, testid }) => {
  const onConfirmUnnestClick = useCallback(
    () => {
      onUnnest();
    },
    [onUnnest]
  );

  return (
    <>
      <Content>
        <Heading size='2'>Unnest</Heading>
      </Content>
      <Row>
        <Text size={'m'}>{'This will disconnect your token from the parent NFT. All other nesting connections will remain intact.'}</Text>
      </Row>
      <ButtonWrapper>
        <Button
          onClick={onConfirmUnnestClick}
          role='primary'
          title='Confirm'
          testid={`${testid}-confirm-button`}
        />
      </ButtonWrapper>
    </>
  );
};

const UnnestStagesModal: FC<TBundleTrunsferModalBodyProps> = ({ token, onFinish, testid }) => {
  const { collectionId, tokenId } = token;
  const { stages, status, initiate } = useUnnestStages({ tokenId, collectionId });
  const { info } = useNotifications();
  const { selectedAccount } = useAccounts();

  useEffect(() => {
    if (!selectedAccount?.address) return;
    initiate(null);
  }, [selectedAccount]);

  useEffect(() => {
    if (status === StageStatus.success) {
      info(
        <div data-testid={`${testid}-success-notification`}><Link href={`/token/${token?.collectionId}/${token?.tokenId}`} title={`${''} #${token?.tokenId}`}/> unnested</div>,
        { name: 'success', size: 32, color: 'var(--color-additional-light)' }
      );
    }
  }, [status]);

  return (
    <div>
      <DefaultMarketStages
        stages={stages}
        status={status}
        onFinish={onFinish}
        testid={testid}
      />
    </div>
  );
};

const Row = styled.div`
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Content = styled.div`
  && h2 {
    margin-bottom: 32px;
  }
`;
