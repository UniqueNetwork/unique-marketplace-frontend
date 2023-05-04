import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Heading, Loader, SelectOptionProps } from '@unique-nft/ui-kit';
import { Text, useNotifications, Dropdown, Button, Modal } from 'components/UI';
import { BN } from '@polkadot/util';
import styled from 'styled-components';

import { toChainFormatAddress, validateAddress } from 'api/chainApi/utils/addressUtils';
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
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { MarketAccount as Account } from 'account/AccountContext';

export type TransferFundsModalProps = {
  isVisible: boolean
  senderAddress?: string
  onFinish(): void
  testid: string
}

export const TransferFundsModal: FC<TransferFundsModalProps> = ({ isVisible, senderAddress, onFinish, testid }) => {
  const [status, setStatus] = useState<'ask' | 'transfer-stage'>('ask');
  const [sender, setSender] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);

  const onTransfer = useCallback((_sender: string, _recipient: string, _amount: string) => {
    setRecipient(_recipient);
    setSender(_sender);
    setAmount(Number(_amount));
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
     testid={`${testid}-ask`}
   />);
  }
  if (status === 'transfer-stage') {
    return (<TransferFundsStagesModal
      isVisible={isVisible}
      sender={sender || ''}
      recipient={recipient}
      amount={amount}
      onFinish={onFinishStages}
      testid={`${testid}-stages`}
    />);
  }
  return null;
};

type AskSendFundsModalProps = {
  isVisible: boolean
  senderAddress: string
  onFinish(sender: string, recipient: string, amount: string): void
  onClose(): void
  testid: string
}

export const AskTransferFundsModal: FC<AskSendFundsModalProps> = ({ isVisible, onFinish, senderAddress, onClose, testid }) => {
  const { chainProperties, api, prefixes } = useApi();
  const { accounts, selectedAccount } = useAccounts();
  const [sender, setSender] = useState<Account>();
  const [recipientAddress, setRecipientAddress] = useState<string | Account | undefined>();
  const [isValidRecipientAddress, setIsValidRecipientAddress] = useState(true);
  const [amount, setAmount] = useState<string>('');
  const [kusamaFee, setKusamaFee] = useState('0');
  const [isFeeLoading, setIsFeeLoading] = useState(false);
  const deviceSize = useDeviceSize();

  useEffect(() => {
    const account = accounts.find((account) => account.address === senderAddress);
    setSender(account);
  }, [senderAddress, accounts]);

  const getFee = useCallback((newRecipientAddress, amount) => {
    setIsFeeLoading(true);
    return debounce(() => {
      if (!selectedAccount || !api?.market) return;
      const recipient = typeof newRecipientAddress === 'string' ? newRecipientAddress : newRecipientAddress?.address;
      api?.market?.getFee(selectedAccount.address, recipient, new BN(fromStringToBnString(amount)))
      .then((fee) => {
        setKusamaFee(fee || '0');
      }).catch((e) => {
        console.log(e);
      }).finally(() => {
        setIsFeeLoading(false);
      });
    }, 300);
  }, [api?.market, selectedAccount]);

  const formatAddress = useCallback((address: string) => {
    return toChainFormatAddress(address, chainProperties?.SS58Prefix || 0);
  }, [chainProperties?.SS58Prefix]);

  const accountsWithQuartzAddresses = useMemo(() => (
    accounts.map((account) => ({ ...account, quartzAddress: formatAddress(account.address) }))
  ), [accounts, formatAddress]);

  const [filteredAccounts, setFilteredAccounts] = useState(accountsWithQuartzAddresses);

  useEffect(() => {
    setFilteredAccounts(accountsWithQuartzAddresses);
  }, [accountsWithQuartzAddresses]);

  const recipientBalance = useMemo(() => {
    return typeof recipientAddress !== 'string' && recipientAddress?.balance?.parsed;
  }, [recipientAddress]);

  const onAmountChange = useCallback((value: string) => {
    setAmount(value);
    getFee(recipientAddress, value)();
  }, [setAmount, getFee, recipientAddress]);

  const isAmountGreaterThanBalance = useMemo(() => {
    const amountBN = new BN(fromStringToBnString(amount));
    return amountBN.gt(sender?.balance?.raw || new BN(0));
  }, [amount, sender?.balance?.raw]);

  const isAmountPlusFeeGreaterThanBalance = useMemo(() => {
    const amountBN = new BN(fromStringToBnString(amount));
    return amountBN.add(new BN(fromStringToBnString(kusamaFee))).gt(sender?.balance?.raw || new BN(0));
  }, [amount, sender?.balance?.raw, kusamaFee]);

  const isConfirmDisabled = useMemo(() => {
    return !isValidRecipientAddress || !sender || !recipientAddress || Number(amount) <= 0 || isAmountGreaterThanBalance || isAmountPlusFeeGreaterThanBalance;
  }, [amount, recipientAddress, sender, isAmountGreaterThanBalance, isValidRecipientAddress, isAmountPlusFeeGreaterThanBalance]);

  const onSend = useCallback(() => {
    if (isConfirmDisabled) return;
    const recipient = typeof recipientAddress === 'string' ? recipientAddress : recipientAddress?.address;
    onFinish(sender?.address || '', recipient || '', amount.toString());
  }, [sender, recipientAddress, amount, onFinish, isConfirmDisabled]);

  const onFilter = useCallback((input: string) => {
    setFilteredAccounts(accountsWithQuartzAddresses.filter((account) => {
      return account.quartzAddress.toLowerCase().includes(input.toLowerCase()) || account.name?.toLowerCase().includes(input.toLowerCase());
    }));
  }, [accountsWithQuartzAddresses]);

  const onChangeAddress = useCallback((value: string | Account) => {
    setRecipientAddress(value);
    getFee(value, amount)();

    if (typeof value === 'string') {
      const isValid = value ? validateAddress(value, prefixes) : true;
      setIsValidRecipientAddress(isValid);
      onFilter(value);
    } else {
      setFilteredAccounts(accountsWithQuartzAddresses);
      setIsValidRecipientAddress(true);
    }
  }, [accountsWithQuartzAddresses, onFilter, amount, getFee, prefixes]);

  const onCloseModal = useCallback(() => {
    setRecipientAddress('');
    setAmount('');
    setFilteredAccounts(accountsWithQuartzAddresses);
    setKusamaFee('0');
    onClose();
  }, [accountsWithQuartzAddresses, onClose]);

  const onChangeSender = useCallback((value: SelectOptionProps) => {
    setSender(value as unknown as Account);
  }, []);

  const tokenSymbol = useMemo(() => chainProperties?.token || '', [chainProperties]);

  return (<Modal isVisible={isVisible} isClosable={true} onClose={onCloseModal}>
    <Content>
      <Heading size='2' testid={`${testid}-heading`}>{'Send funds'}</Heading>
    </Content>

    <Text size={'s'} color={'grey-500'}>{'From'}</Text>
    <SenderSelectWrapper>
      <Dropdown
        optionKey={'address'}
        options={accounts as unknown as SelectOptionProps[]}
        onChange={onChangeSender}
        optionRender={(option) => (
          <AddressOptionWrapper>
            <AccountCard accountName={(option as unknown as Account)?.name || ''}
              accountAddress={(option as unknown as Account)?.address || ''}
              canCopy={false}
              isShort={deviceSize < DeviceSize.md}
            />
          </AddressOptionWrapper>
        )}
        iconRight={{ name: 'triangle', size: 8 }}
      >
        <AddressWrapper>
          <AccountCard accountName={sender?.name || ''}
            accountAddress={sender?.address || ''}
            canCopy={false}
            isShort={deviceSize < DeviceSize.md}
          />
        </AddressWrapper>
      </Dropdown>
    </SenderSelectWrapper>
    <AmountWrapper>
      <Text
        testid={`${testid}-balance`}
        size={'s'}
      >{`${sender?.balance?.parsed} ${tokenSymbol}`}</Text>
    </AmountWrapper>

    <Text size={'s'} color={'grey-500'}>{'To'}</Text>
    <RecipientSelectWrapper >
      <SelectInput<Account>
        testid={`${testid}-select-address`}
        options={filteredAccounts as unknown as Account[]}
        value={recipientAddress}
        onChange={onChangeAddress}
        renderOption={(option) => <AddressOptionWrapper>
          <AccountCard accountName={option.name || ''}
            accountAddress={option.address}
            canCopy={false}
            isShort={deviceSize < DeviceSize.md}
            testid={`${testid}-selected`}
          />
        </AddressOptionWrapper>}
      />
    </RecipientSelectWrapper>
    <AmountWrapper>
      {recipientBalance && <Text
        testid={`${testid}-recipient-balance`}
        size={'s'}
      >{`${recipientBalance || 0} ${tokenSymbol}`}</Text> }
    </AmountWrapper>
    {!isValidRecipientAddress && <ErrorWrapper size={'s'} color={'var(--color-coral-500)'} >Address is not valid</ErrorWrapper>}
    <AmountInputWrapper>
      <NumberInput
        value={amount}
        onChange={onAmountChange}
        placeholder={`Amount (${tokenSymbol})`}
        testid={`${testid}-amount-input`}
      />
    </AmountInputWrapper>
    {isAmountGreaterThanBalance && <LowBalanceWrapper>
      <Text size={'s'}>Your balance is too low</Text>
    </LowBalanceWrapper>}
    {(!isAmountGreaterThanBalance && isAmountPlusFeeGreaterThanBalance) && <LowBalanceWrapper>
      <Text size={'s'}>Your balance is insufficient due to transaction fee</Text>
    </LowBalanceWrapper>}
    <KusamaFeeMessage
      isFeeLoading={isFeeLoading}
      kusamaFee={kusamaFee}
      testid={`${testid}-fee-message`}
    />
    <ButtonWrapper>
      <Button
        testid={`${testid}-confirm-button`}
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
  testid: string
};

const TransferFundsStagesModal: FC<TransferFundsStagesModalProps & TTransferFunds> = ({ isVisible, onFinish, sender, amount, recipient, testid }) => {
  const { stages, status, initiate } = useTransferFundsStages(sender);
  const { info } = useNotifications();
  useEffect(() => { void initiate({ sender, recipient, amount }); }, [sender, recipient, amount]);

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
      <DefaultMarketStages
        stages={stages}
        status={status}
        onFinish={onFinish}
        testid={`${testid}`}
      />
    </div>
  </Modal>);
};

type KusamaFeeMessageProps = {
  isFeeLoading: boolean,
  kusamaFee: string
  testid: string
}

const KusamaFeeMessage: FC<KusamaFeeMessageProps> = ({ isFeeLoading, kusamaFee, testid }) => {
  return (
    <KusamaFeeMessageWrapper>
      <Text
        testid={`${testid}-text`}
        color='additional-warning-500'
        size='s'
      >
        {isFeeLoading
          ? <Loader label='Loading fee...' />
          : <>A fee of {kusamaFee === '0' ? 'some' : `~ ${kusamaFee}`} !!!OLD_KSM!!! can be applied to the transaction, unless the transaction is sponsored</>}
      </Text>
    </KusamaFeeMessageWrapper>
  );
};

const Content = styled.div`
  && h2 {
    margin-bottom: 0;
  }
`;

const SenderSelectWrapper = styled.div`
  position: relative;
  
  & .unique-dropdown {
    width: 100%;
    cursor: pointer;
    min-height: 64px;
    .dropdown-options {
      max-height: 229px;
      overflow-y: auto;
      row-gap: calc(var(--gap) / 4);
    }
  }
  & .icon-triangle{
    position: absolute;
    top: calc(50% - 4px);
    right: calc(var(--gap) / 2);
  }
`;

const AddressWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
  border: 1px solid var(--grey-300);
  border-radius: 4px;
  padding: calc(var(--gap) / 2) var(--gap);
  align-items: center;
  cursor: pointer;
  .unique-text {
    text-overflow: ellipsis;
    overflow: hidden;
  }
  &:hover {
    border: 1px solid var(--color-grey-500);
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
  .unique-input-text {
    width: 100%;
  }
`;

const AmountWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const AmountInputWrapper = styled.div`
  margin-top: calc(var(--gap) * 1.5);
  .unique-input-text, div {
    width: 100%;
  }
`;

const ErrorWrapper = styled(Text)`
  margin-top: calc(var(--gap) / 2);
  display: block;
`;

const LowBalanceWrapper = styled(AmountWrapper)`
  position: absolute;
  right: calc(var(--gap) * 1.5);
  span {
    color: ${Coral700} !important;
  }
`;
