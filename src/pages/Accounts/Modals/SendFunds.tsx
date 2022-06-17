import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Heading, Modal, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';

import { TTransferFunds } from './types';
import { useAccounts } from '../../../hooks/useAccounts';
import { AdditionalWarning100 } from '../../../styles/colors';
import { SelectInput } from '../../../components/SelectInput/SelectInput';
import { Account } from '../../../account/AccountContext';
import DefaultMarketStages from '../../Token/Modals/StagesModal';
import { useTransferFundsStages } from '../../../hooks/accountStages/useTransferFundsStages';
import { formatKusamaBalance } from '../../../utils/textUtils';
import { StageStatus } from '../../../types/StagesTypes';
import { NotificationSeverity } from '../../../notification/NotificationContext';
import { useNotification } from '../../../hooks/useNotification';
import { NumberInput } from '../../../components/NumberInput/NumberInput';
import AccountCard from '../../../components/Account/Account';

const tokenSymbol = 'KSM';

export type TransferFundsModalProps = {
  isVisible: boolean
  senderAddress?: string
  onFinish(): void
}

export const TransferFundsModal: FC<TransferFundsModalProps> = ({ isVisible, senderAddress, onFinish }) => {
  const [status, setStatus] = useState<'ask' | 'transfer-stage'>('ask');
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const onTransfer = useCallback((_sender: string, _recipient: string, _amount: string) => {
    setRecipient(_recipient);
    setAmount(_amount);
    setStatus('transfer-stage');
  }, [setStatus, setRecipient, setAmount]);

  const onFinishStages = useCallback(() => {
    setStatus('ask');
    onFinish();
  }, [onFinish]);

  if (status === 'ask') {
   return (<AskTransferFundsModal
     isVisible={isVisible}
     onFinish={onTransfer}
     senderAddress={senderAddress || ''}
     onClose={onFinish}
   />);
  }
  if (status === 'transfer-stage') {
    return (<TransferFundsStagesModal
      isVisible={isVisible}
      sender={senderAddress || ''}
      recipient={recipient}
      amount={amount}
      onFinish={onFinishStages}
    />);
  }
  return null;
};

type AskSendFundsModalProps = {
  isVisible: boolean
  senderAddress: string
  onFinish(sender: string, recipient: string, amount: string): void
  onClose(): void
}

export const AskTransferFundsModal: FC<AskSendFundsModalProps> = ({ isVisible, onFinish, senderAddress, onClose }) => {
  const { accounts } = useAccounts();
  const [recipientAddress, setRecipientAddress] = useState<string | Account | undefined>();
  const [amount, setAmount] = useState<string>('0');

  const sender = useMemo(() => {
    const account = accounts.find((account) => account.address === senderAddress);
    return account;
  }, [accounts, senderAddress]);

  const recipientBalance = useMemo(() => {
    const account = accounts.find((account) => account.address === recipientAddress);
    return account?.balance?.KSM;
  }, [accounts, recipientAddress]);

  const onAmountChange = useCallback((value: string) => {
    setAmount(value);
  }, [setAmount]);

  const onSend = useCallback(() => {
    const recipient = typeof recipientAddress === 'string' ? recipientAddress : recipientAddress?.address;
    onFinish(senderAddress, recipient || '', amount.toString());
  }, [senderAddress, recipientAddress, amount, onFinish]);

  return (<Modal isVisible={isVisible} isClosable={true} onClose={onClose}>
    <Content>
      <Heading size='2'>{'Send funds'}</Heading>
    </Content>

    <Text size={'s'} color={'grey-500'}>{'From'}</Text>
    <AddressWrapper>
      <AccountCard accountName={sender?.meta.name || ''} accountAddress={senderAddress} canCopy={false} />
    </AddressWrapper>
    <AmountWrapper>
      <Text size={'s'}>{`${formatKusamaBalance(sender?.balance?.KSM?.toString() || 0)} ${tokenSymbol}`}</Text>
    </AmountWrapper>

    <Text size={'s'} color={'grey-500'}>{'To'}</Text>
    <RecipientSelectWrapper >
      <SelectInput<Account>
        options={accounts}
        value={recipientAddress}
        onChange={setRecipientAddress}
        renderOption={(option) => <AddressOptionWrapper>
          <AccountCard accountName={option.meta.name || ''} accountAddress={option.address} canCopy={false} />
        </AddressOptionWrapper>}
      />
    </RecipientSelectWrapper>
    <AmountWrapper>
      {recipientBalance && <Text size={'s'}>{`${formatKusamaBalance(recipientBalance?.toString() || 0)} ${tokenSymbol}`}</Text> }
    </AmountWrapper>
    <AmountInputWrapper>
      <NumberInput value={amount} onChange={onAmountChange} />
    </AmountInputWrapper>
    <TextStyled
      color='additional-warning-500'
      size='s'
    >
      A fee of ~ 0.000000000000052 testUNQ can be applied to the transaction, unless the transaction is sponsored
    </TextStyled>
    <ButtonWrapper>
      <Button
        // disabled={!validPassword || !password || !name}
        onClick={onSend}
        role='primary'
        title='Confirm'
      />
    </ButtonWrapper>
  </Modal>);
};

type TransferFundsStagesModalProps = {
  isVisible: boolean
  onFinish: () => void
};

const TransferFundsStagesModal: FC<TransferFundsStagesModalProps & TTransferFunds> = ({ isVisible, onFinish, sender, amount, recipient }) => {
  const { stages, status, initiate } = useTransferFundsStages(sender);
  const { push } = useNotification();
  useEffect(() => { initiate({ sender, recipient, amount }); }, [sender, recipient, amount]);

  useEffect(() => {
    if (status === StageStatus.success) {
      push({ severity: NotificationSeverity.success, message: 'Funds transfer completed' });
    }
  }, [push, status]);

  return (<Modal isVisible={isVisible} isClosable={false}>
    <div>
      <DefaultMarketStages stages={stages} status={status} onFinish={onFinish} />
    </div>
  </Modal>);
};

const Content = styled.div`
  && h2 {
    margin-bottom: 0;
  }
`;

const AddressWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
  border: 1px solid var(--grey-300);
  border-radius: 4px;
  padding: calc(var(--gap) / 2) var(--gap);
  align-items: center;
  .unique-text {
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const AddressOptionWrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: calc(var(--gap) / 2);
`;

const TextStyled = styled(Text)`
  box-sizing: border-box;
  display: flex;
  padding: 8px 16px;
  margin: calc(var(--gap) * 1.5) 0;
  border-radius: 4px;
  background-color: ${AdditionalWarning100};
  width: 100%;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  column-gap: var(--gap);
`;

const RecipientSelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) / 2);
  margin-bottom: calc(var(--gap) * 1.5);
  .unique-input-text {
    width: 100%;
  }
`;

const AmountWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const AmountInputWrapper = styled.div`
  .unique-input-text, div {
    width: 100%;
  }
`;
