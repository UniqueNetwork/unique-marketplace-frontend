import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Heading, Link } from '@unique-nft/ui-kit';
import { Text, useNotifications, Button } from 'components/UI';
import { BN } from '@polkadot/util';
import styled from 'styled-components';

import DefaultMarketStages from '../Modals/StagesModal';
import { useAccounts } from '../../../hooks/useAccounts';
import { StageStatus } from '../../../types/StagesTypes';
import { useUnnestStages } from '../../../hooks/marketplaceStages/useUnnestStages';
import { TBundleTrunsferModalBodyProps } from './BundleTrunsferModal';
import { FeeMessage } from 'components';
import { INestingToken } from 'components/BundleTree/types';
import { useApi } from 'hooks/useApi';
import { debounce } from 'utils/helpers';
import { fromStringToBnString } from 'utils/bigNum';
import { Coral700 } from 'styles/colors';
import { TokenByIdResponse, TokenIdQuery } from '@unique-nft/sdk';

export const UnnestModal: FC<TBundleTrunsferModalBodyProps> = ({ token, setIsClosable, onFinish, testid }) => {
  const { selectedAccount } = useAccounts();
  const [status, setStatus] = useState<'ask' | 'unnest-stage'>('ask'); // TODO: naming

  const onUnnest = useCallback(() => {
    setStatus('unnest-stage');
    setIsClosable(false);
  }, [setStatus, setIsClosable]);

  if (!selectedAccount || !token) return null;

  if (status === 'ask') return (<AskUnnestModal token={token} onUnnest={onUnnest} testid={`${testid}-ask-transfer`} />);
  if (status === 'unnest-stage') {
    return (<UnnestStagesModal
      onFinish={onFinish}
      tokenId={token.tokenId}
      collectionId={token.collectionId}
      setIsClosable={setIsClosable}
      testid={testid}
    />);
  }
  return null;
};

const AskUnnestModal: FC<{ token: INestingToken | TokenByIdResponse, onUnnest(): void, testid: string }> = ({ token, onUnnest, testid }) => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const [isFeeLoading, setIsFeeLoading] = useState(false);
  const [fee, setFee] = useState<string>('0');

  useEffect(() => {
    if (!api?.nft || !token || !selectedAccount) return;
    setIsFeeLoading(true);
    debounce(() => {
      api.nft?.getUnnestFee(
        token.collectionId,
        token.tokenId,
        1,
        { account: selectedAccount })
      .then((fee) => {
        setFee(fee || '0');
      }).catch((e) => {
        console.error('Failed to get fee: ', e);
      }).finally(() => {
        setIsFeeLoading(false);
      });
    }, 300)();
  }, [token.tokenId, token.collectionId, api?.nft, selectedAccount?.address]);

  const onConfirmUnnestClick = useCallback(
    () => {
      onUnnest();
    },
    [onUnnest]
  );

  const isFeeGreaterThanBalance = useMemo(() => {
    if (!fee) return false;
    const feeBN = new BN(fromStringToBnString(fee));
    return feeBN.gt(selectedAccount?.balance?.raw || new BN(0));
  }, [fee, selectedAccount?.balance?.raw]);

  return (
    <>
      <Content>
        <Heading size='2'>Unnest</Heading>
      </Content>
      <Row>
        <Text size={'m'}>{'This will disconnect your token from the parent NFT. All other nesting connections will remain intact.'}</Text>
      </Row>
      <Row>
        {(!isFeeLoading && isFeeGreaterThanBalance) && <LowBalanceWrapper>
          <Text size={'s'}>Your balance is insufficient due to transaction fee</Text>
        </LowBalanceWrapper>}
        <FeeMessage
          isFeeLoading={isFeeLoading}
          fee={fee || '0'}
          testid={`${testid}-fee-message`}
        />
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

const UnnestStagesModal: FC<Omit<TBundleTrunsferModalBodyProps, 'token'> & TokenIdQuery> = ({ tokenId, collectionId, onFinish, testid }) => {
  const { stages, status, initiate } = useUnnestStages({ tokenId, collectionId });
  const { info } = useNotifications();
  const { selectedAccount } = useAccounts();

  useEffect(() => {
    if (!selectedAccount?.address) return;
    void initiate(null);
  }, [selectedAccount?.address]);

  useEffect(() => {
    if (status === StageStatus.success) {
      info(
        <div data-testid={`${testid}-success-notification`}><Link href={`/token/${collectionId}/${tokenId}`} title={`${''} #${tokenId}`}/> unnested</div>,
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

const LowBalanceWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  span {
    color: ${Coral700} !important;
  }
`;
