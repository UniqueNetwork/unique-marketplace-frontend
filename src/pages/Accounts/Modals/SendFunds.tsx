import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Heading, Modal, Text, Loader, useNotifications } from '@unique-nft/ui-kit';
import { BN } from '@polkadot/util';
import styled from 'styled-components';

import { toChainFormatAddress } from 'api/uniqueSdk/utils/addressUtils';
import { Account } from 'account/AccountContext';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import { useTransferFundsStages } from 'hooks/accountStages/useTransferFundsStages';
import { SelectInput } from 'components/SelectInput/SelectInput';
import { NumberInput } from 'components/NumberInput/NumberInput';
import AccountCard from 'components/Account/Account';
import { StageStatus } from 'types/StagesTypes';
import { formatKusamaBalance } from 'utils/textUtils';
import { fromStringToBnString } from 'utils/bigNum';
import { debounce } from 'utils/helpers';
import { AdditionalWarning100, Coral700 } from 'styles/colors';
import DefaultMarketStages from '../../Token/Modals/StagesModal';
import { TTransferFunds } from './types';

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
  const { accounts, selectedAccount } = useAccounts();
  const [recipientAddress, setRecipientAddress] = useState<string | Account | undefined>();
  const [amount, setAmount] = useState<string>('');
  const { chainData, api } = useApi();
  const [kusamaFee, setKusamaFee] = useState('0');
  const [isFeeLoading, setIsFeeLoading] = useState(false);

  const getKusamaFee = useCallback(() => {
    setIsFeeLoading(true);
    return debounce(() => {
      if (!selectedAccount || !api?.market) return;
      const recipient = typeof recipientAddress === 'string' ? recipientAddress : recipientAddress?.address;
      api?.market?.getKusamaFee(selectedAccount.address, recipient, new BN(fromStringToBnString(amount)))
      .then((fee) => {
        setKusamaFee(formatKusamaBalance(fee?.toString() || '0'));
      }).catch((e) => {
        console.log(e);
      }).finally(() => {
        setIsFeeLoading(false);
      });
    }, 300);
  }, [api?.market, recipientAddress, selectedAccount, amount]);

  const formatAddress = useCallback((address: string) => {
    return toChainFormatAddress(address, chainData?.SS58Prefix || 0);
  }, [chainData?.SS58Prefix]);

  const accountsWithQuartzAdresses = useMemo(() => (
    accounts.map((account) => ({ ...account, quartzAddress: formatAddress(account.address) }))
  ), [accounts, formatAddress]);

  const [filteredAccounts, setFilteredAccounts] = useState(accountsWithQuartzAdresses);

  useEffect(() => {
    setFilteredAccounts(accountsWithQuartzAdresses);
  }, [accountsWithQuartzAdresses]);

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
    getKusamaFee()();
  }, [setAmount, getKusamaFee]);

  const isConfirmDisabled = useMemo(() => (
    !recipientAddress || Number(amount) <= 0 || Number(amount) > Number(formatKusamaBalance(sender?.balance?.KSM?.toString() || 0))
  ), [amount, recipientAddress, sender]);

  const onSend = useCallback(() => {
    if (isConfirmDisabled) return;
    const recipient = typeof recipientAddress === 'string' ? recipientAddress : recipientAddress?.address;
    onFinish(senderAddress, recipient || '', amount.toString());
  }, [senderAddress, recipientAddress, amount, onFinish, isConfirmDisabled]);

  const onFilter = useCallback((input: string) => {
    setFilteredAccounts(accountsWithQuartzAdresses.filter((account) => {
      return account.quartzAddress.toLowerCase().includes(input.toLowerCase()) || account.meta.name?.toLowerCase().includes(input.toLowerCase());
    }));
  }, [accountsWithQuartzAdresses]);

  const onChangeAddress = useCallback((input) => {
    setRecipientAddress(input);
    getKusamaFee()();
    if (typeof input === 'string') {
      onFilter(input);
    } else {
      setFilteredAccounts(accountsWithQuartzAdresses);
    }
  }, [accountsWithQuartzAdresses, onFilter]);

  const onCloseModal = useCallback(() => {
    setRecipientAddress('');
    setAmount('');
    setFilteredAccounts(accountsWithQuartzAdresses);
    setKusamaFee('0');
    onClose();
  }, [accountsWithQuartzAdresses, onClose]);

  return (<Modal isVisible={isVisible} isClosable={true} onClose={onCloseModal}>
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
        options={filteredAccounts}
        value={recipientAddress}
        onChange={onChangeAddress}
        renderOption={(option) => <AddressOptionWrapper>
          <AccountCard accountName={option.meta.name || ''} accountAddress={option.address} canCopy={false} />
        </AddressOptionWrapper>}
      />
    </RecipientSelectWrapper>
    <AmountWrapper>
      {recipientBalance && <Text size={'s'}>{`${formatKusamaBalance(recipientBalance?.toString() || 0)} ${tokenSymbol}`}</Text> }
    </AmountWrapper>
    <AmountInputWrapper>
      <NumberInput value={amount} onChange={onAmountChange} placeholder={'Amount (KSM)'} />
    </AmountInputWrapper>
    {Number(amount) > Number(formatKusamaBalance(sender?.balance?.KSM?.toString() || 0)) && <LowBalanceWrapper>
      <Text size={'s'}>Your balance is too low</Text>
    </LowBalanceWrapper>}
    <KusamaFeeMessage isFeeLoading={isFeeLoading} kusamaFee={kusamaFee} />
    <ButtonWrapper>
      <Button
        disabled={isConfirmDisabled}
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
  const { info } = useNotifications();
  useEffect(() => { initiate({ sender, recipient, amount }); }, [sender, recipient, amount]);

  useEffect(() => {
    if (status === StageStatus.success) {
      info(
        'Funds transfer completed',
        { name: 'success', size: 32, color: 'var(--color-additional-light)' }
      );
    }
  }, [info, status]);

  return (<Modal isVisible={isVisible} isClosable={false}>
    <div>
      <DefaultMarketStages stages={stages} status={status} onFinish={onFinish} />
    </div>
  </Modal>);
};

type KusamaFeeMessageProps = {
  isFeeLoading: boolean,
  kusamaFee: string
}

const KusamaFeeMessage: FC<KusamaFeeMessageProps> = ({ isFeeLoading, kusamaFee }) => {
  return (
    <KusamaFeeMessageWrapper>
      <Text color='additional-warning-500' size='s'>
        {isFeeLoading
          ? <Loader label='Loading fee...' />
          : <>A fee of {kusamaFee === '0' ? 'some' : `~ ${kusamaFee}`} KSM can be applied to the transaction, unless the transaction is sponsored</>}
      </Text>
    </KusamaFeeMessageWrapper>
  );
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

const KusamaFeeMessageWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  padding: 8px 16px;
  margin: calc(var(--gap) * 1.5) 0;
  border-radius: 4px;
  background-color: ${AdditionalWarning100};
  width: 100%;

  .unique-loader {
    display: flex;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  column-gap: var(--gap);
  margin-top: calc(var(--gap) * 1.5);
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

const LowBalanceWrapper = styled(AmountWrapper)`
  position: absolute;
  right: calc(var(--gap) * 1.5);
  span {
    color: ${Coral700} !important;
  }
`;
