import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Heading, Link } from '@unique-nft/ui-kit';
import { useNotifications, Button, Text } from 'components/UI';
import styled from 'styled-components';

import { TTransfer } from './types';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { useTransferStages } from '../../../hooks/marketplaceStages';
import DefaultMarketStages from './StagesModal';
import { useAccounts } from '../../../hooks/useAccounts';
import { StageStatus } from '../../../types/StagesTypes';
import { TextInput } from 'components/TextInput/TextInput';
import { WarningBlock } from 'components/WarningBlock/WarningBlock';
import { FeeMessage } from 'components';
import { Coral700 } from 'styles/colors';
import { debounce } from 'utils/helpers';
import { useApi } from 'hooks/useApi';
import { TokenByIdResponse } from '@unique-nft/sdk';
import { fromStringToBnString } from 'utils/bigNum';
import { BN } from '@polkadot/util';

export const TransferModal: FC<TTokenPageModalBodyProps> = ({ token, setIsClosable, onFinish, testid, collection }) => {
  const { selectedAccount } = useAccounts();
  const [status, setStatus] = useState<'ask' | 'transfer-stage'>('ask'); // TODO: naming
  const [recipient, setRecipient] = useState<string>('');

  const onTransfer = useCallback((_recipient: string) => {
    setRecipient(_recipient);
    setStatus('transfer-stage');
    setIsClosable(false);
  }, [setStatus, setRecipient, setIsClosable]);

  if (!selectedAccount) return null;

  if (status === 'ask') return (<AskTransferModal token={token} onTransfer={onTransfer} testid={`${testid}-ask-transfer`} />);
  if (status === 'transfer-stage') {
    return (<TransferStagesModal
      recipient={recipient}
      onFinish={onFinish}
      token={token}
      setIsClosable={setIsClosable}
      sender={selectedAccount.address}
      testid={testid}
      collection={collection}
    />);
  }
  return null;
};

type AskTransferModalProps = {
  token?: TokenByIdResponse
  onTransfer(receiver: string): void
  testid: string
}

const AskTransferModal: FC<AskTransferModalProps> = ({ token, onTransfer, testid }) => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const [address, setAddress] = useState<string>('');
  const [isFeeLoading, setIsFeeLoading] = useState(false);
  const [fee, setFee] = useState<string>('0');

  const onAddressInputChange = useCallback((value: string) => {
    setAddress(value);
    getFee(value);
  }, []);

  const onConfirmTransferClick = useCallback(
    () => {
      if (!address) return;
      onTransfer(address);
    },
    [address, onTransfer]
  );

  const getFee = useCallback((newRecipientAddress) => {
    setIsFeeLoading(true);
    return debounce(() => {
      if (!api?.market || !token || !selectedAccount || !newRecipientAddress) return setIsFeeLoading(false);

      const recipient = typeof newRecipientAddress === 'string' ? newRecipientAddress : newRecipientAddress?.address;
      api?.market?.getTransferTokenFee(
        selectedAccount.address,
        recipient,
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
    }, 300);
  }, [api?.market, token, selectedAccount?.account]);

  const isFeeGreaterThanBalance = useMemo(() => {
    if (!fee) return false;
    const feeBN = new BN(fromStringToBnString(fee));
    return feeBN.gt(selectedAccount?.balance?.raw || new BN(0));
  }, [fee, selectedAccount?.balance?.raw]);

  return (
    <>
      <Content>
        <Heading size='2'>Transfer NFT token</Heading>
      </Content>
      <InputWrapper
        label='Please enter the address you wish to send the NFT to'
        onChange={onAddressInputChange}
        value={address}
        testid={`${testid}-address-input`}
      />
      <WarningBlock>
        Proceed with caution, once confirmed the transaction cannot be reverted.
      </WarningBlock>
      <WarningBlock>
        Make sure to use a Substrate address created with a Polkadot.&#123;js&#125; wallet. There is no guarantee that third-party wallets, exchanges or hardware wallets can successfully sign and process your transfer which will result in a possible loss of the NFT.
      </WarningBlock>
      {(!isFeeGreaterThanBalance) && <LowBalanceWrapper>
        <Text size={'s'}>Your balance is insufficient due to transaction fee</Text>
      </LowBalanceWrapper>}
      <FeeMessage
        isFeeLoading={isFeeLoading}
        fee={fee || '0'}
        testid={`${testid}-fee-message`}
      />
      <ButtonWrapper>
        <Button
          disabled={!address}
          onClick={onConfirmTransferClick}
          role='primary'
          title='Confirm'
          testid={`${testid}-confirm-button`}
        />
      </ButtonWrapper>
    </>
  );
};

const TransferStagesModal: FC<TTokenPageModalBodyProps & TTransfer> = ({ token, collection, onFinish, sender, recipient, testid }) => {
  const { stages, status, initiate } = useTransferStages(token?.collectionId || 0, token?.tokenId || 0);
  const { info } = useNotifications();

  useEffect(() => {
    initiate({ sender, recipient });
  }, [sender, recipient]);

  useEffect(() => {
    if (status === StageStatus.success) {
      info(
        <div data-testid={`${testid}-success-notification`}><Link href={`/token/${token?.collectionId}/${token?.tokenId}`} title={`${collection?.tokenPrefix} #${token?.tokenId}`}/> transferred</div>,
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

const InputWrapper = styled(TextInput)`
  margin-bottom: 8px;
  width: 100%;

  label {
    margin-bottom: 16px;    
    white-space: break-spaces;
    height: auto;
  }
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
  position: absolute;
  right: calc(var(--gap) * 1.5);
  span {
    color: ${Coral700} !important;
  }
`;
