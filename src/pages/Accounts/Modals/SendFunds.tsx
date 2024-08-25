import React, { FCC, useCallback, useEffect, useMemo, useState } from 'react';
import { Text, useNotifications, Dropdown, Button, Modal, Heading, Select } from 'components/UI';
import { BN } from '@polkadot/util';
import styled from 'styled-components';

import { validateAddress } from 'api/chainApi/utils/addressUtils';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import { useTransferFundsStages } from 'hooks/accountStages/useTransferFundsStages';
import { SelectInput } from 'components/SelectInput/SelectInput';
import { NumberInput } from 'components/NumberInput/NumberInput';
import AccountCard from 'components/Account/Account';
import { StageStatus } from 'types/StagesTypes';
import { formatBalance } from 'utils/textUtils';
import { fromStringToBnString } from 'utils/bigNum';
import { debounce } from 'utils/helpers';
import { Coral700 } from 'styles/colors';
import DefaultMarketStages from '../../Token/Modals/StagesModal';
import { TTransferFunds } from './types';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import {Account, WalletsType} from 'account/types';
import { FeeMessage } from 'components';
import { useAccountsFilter } from 'hooks/useAccountsFilter';
import { SelectOptionProps } from 'components/UI/types';
import ComingSoon from 'pages/Token/TokenDetail/CurrencesComingSoon';

export type TransferFundsModalProps = {
  isVisible: boolean
  senderAddress?: string
  onFinish(): void
  testid: string
}

export const TransferFundsModal: FCC<TransferFundsModalProps> = ({ isVisible, senderAddress, onFinish, testid }) => {
  const [status, setStatus] = useState<'ask' | 'transfer-stage'>('ask');
  const [sender, setSender] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState(0);
  const [decimals, setDecimals] = useState(0);

  const onTransfer = useCallback((_sender: string, _recipient: string, _amount: string, _currency: number, _decimals: number) => {
    setRecipient(_recipient);
    setSender(_sender);
    setAmount(Number(_amount));
    setCurrency(_currency);
    setDecimals(_decimals);
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
      currency={currency}
      decimals={decimals}
      onFinish={onFinishStages}
      testid={`${testid}-stages`}
    />);
  }
  return null;
};

type AskSendFundsModalProps = {
  isVisible: boolean
  senderAddress: string
  onFinish(sender: string, recipient: string, amount: string, currency: number, decimals: number): void
  onClose(): void
  testid: string
}

export const AskTransferFundsModal: FCC<AskSendFundsModalProps> = ({ isVisible, onFinish, senderAddress, onClose, testid }) => {
  const { api, prefixes } = useApi();
  const { accounts } = useAccounts();
  const [sender, setSender] = useState<Account>();
  const [recipientAddress, setRecipientAddress] = useState<string | Account | undefined>();
  const [isValidRecipientAddress, setIsValidRecipientAddress] = useState(true);
  const [amount, setAmount] = useState<string>('');
  const [fee, setFee] = useState('0');
  const [isFeeLoading, setIsFeeLoading] = useState(false);
  const [isSetMaxLoading, setIsSetMaxLoading] = useState(false);
  const deviceSize = useDeviceSize();
  const { currencies, currencyMap } = useApi();
  const [selectedCurrencyOption, setSelectedCurrencyOption] = useState(currencyMap.get('0'));
  useEffect(() => {
    setSelectedCurrencyOption(currencyMap.get('0'));
  }, [currencyMap]);
  const isSelectFungibleToken = useMemo(() => selectedCurrencyOption?.id !== currencyMap.get('0')?.id, [currencyMap, selectedCurrencyOption?.id]);

  const { filteredAccounts, onFilter, onReset } = useAccountsFilter({
    excluded: useMemo(() => sender ? [sender?.address] : [], [sender])
  });

  useEffect(() => {
    if (!senderAddress) return;
    const account = accounts.get(senderAddress);
    setSender(account);
  }, [senderAddress, accounts]);

  const getFee = useCallback((newRecipientAddress: string | Account<WalletsType>, amount: number) => {
    setIsFeeLoading(true);
    return debounce(async() => {
      if (!sender || !api?.market || !newRecipientAddress) return setIsFeeLoading(false);
      if (!amount) {
        setFee('0');
        setIsFeeLoading(false);
        return;
      }
      const recipient = typeof newRecipientAddress === 'string' ? newRecipientAddress : newRecipientAddress?.address;

      try {
        const fee = isSelectFungibleToken
          ? await api?.market?.getTransferBalanceFungibleFee({
              collectionId: selectedCurrencyOption?.collectionId || 0,
              address: sender.address,
              recipient,
              amount,
              account: sender
            })
          : await api?.market?.getTransferBalanceFee(sender.address, recipient, amount, { account: sender });
        setFee(fee || '0');
      } catch (e) {
        console.error('Failed to get fee: ', e);
      } finally {
        setIsFeeLoading(false);
      }
    }, 300);
  }, [api?.market, sender, isSelectFungibleToken, selectedCurrencyOption]);

  const onAmountChange = useCallback((value: string) => {
    setAmount(value);
    if (recipientAddress) getFee(recipientAddress, Number(value))();
  }, [setAmount, getFee, recipientAddress]);

  const isAmountGreaterThanBalance = useMemo(() => {
    if (isSelectFungibleToken) {
      if (!selectedCurrencyOption?.id) return false;
      return (
        Number(
          sender?.fungibleBalances?.get(selectedCurrencyOption?.id)?.amount
        ) < Number(amount)
      );
    } else {
      const amountBN = new BN(fromStringToBnString(amount));
      return amountBN.gt(sender?.balances?.proper.raw || new BN(0));
    }
  }, [amount, sender?.balances?.proper.raw, isSelectFungibleToken, selectedCurrencyOption]);

  const isAmountPlusFeeGreaterThanBalance = useMemo(() => {
    const amountBN = new BN(fromStringToBnString(amount));
    return amountBN.add(new BN(fromStringToBnString(fee))).gt(sender?.balances?.proper.raw || new BN(0));
  }, [amount, sender?.balances?.proper.raw, fee]);

  const isConfirmDisabled = useMemo(() => {
    return !isValidRecipientAddress || !sender || !recipientAddress || Number(amount) <= 0 || isAmountGreaterThanBalance || (!isSelectFungibleToken && isAmountPlusFeeGreaterThanBalance);
  }, [amount, recipientAddress, sender, isAmountGreaterThanBalance, isValidRecipientAddress, isAmountPlusFeeGreaterThanBalance]);

  const onSend = useCallback(() => {
    if (isConfirmDisabled || !selectedCurrencyOption) return;
    const recipient = typeof recipientAddress === 'string' ? recipientAddress : recipientAddress?.address;
    const decimals = selectedCurrencyOption?.decimals;

    onFinish(
      sender?.address || '',
      recipient || '',
      amount.toString(),
      Number(selectedCurrencyOption?.collectionId),
      decimals || 0
    );
  }, [sender, recipientAddress, amount, onFinish, isConfirmDisabled, selectedCurrencyOption]);

  const senders = useMemo(
    () => [...accounts.values()].filter(({ address }) => recipientAddress !== address),
    [recipientAddress]
  );

  const onChangeAddress = useCallback((value: string | Account) => {
    setRecipientAddress(value);
    getFee(value, Number(amount))();

    if (typeof value === 'string') {
      const isValid = value ? validateAddress(value, prefixes) : true;
      setIsValidRecipientAddress(isValid);
      onFilter(value);
    } else {
      onReset();
      setIsValidRecipientAddress(true);
    }
  }, [onReset, onFilter, amount, getFee, prefixes]);

  const onCloseModal = useCallback(() => {
    setRecipientAddress('');
    setAmount('');
    onReset();
    setIsValidRecipientAddress(true);
    setFee('0');
    onClose();
  }, [accounts, onClose]);

  const onChangeSender = useCallback((value: SelectOptionProps) => {
    const newSender = value as unknown as Account;
    setSender(newSender);
    if (recipientAddress) getFee(recipientAddress, Number(amount))();
  }, [getFee, recipientAddress, amount]);

  const tokenSymbol = useMemo(() => selectedCurrencyOption?.title || '', [selectedCurrencyOption]);
  const selectedBalance = useMemo(() => {
    if (!selectedCurrencyOption) return;

    return isSelectFungibleToken
      ? formatBalance(
          sender?.fungibleBalances?.get(String(selectedCurrencyOption?.id))
            ?.amount || ''
        )
      : formatBalance(sender?.balances?.proper.parsed || 0);
  }, [
    isSelectFungibleToken,
    sender?.fungibleBalances,
    sender?.balances?.proper.parsed,
    selectedCurrencyOption?.id
  ]);

  const recipientBalance = useMemo(() => {
    if (typeof recipientAddress === 'string' || !selectedCurrencyOption) return;

    return isSelectFungibleToken
      ? recipientAddress?.fungibleBalances?.get(String(selectedCurrencyOption?.id))?.amount || 0
      : recipientAddress?.balances?.proper.parsed || 0;

  }, [recipientAddress, isSelectFungibleToken, selectedCurrencyOption?.id]);


  const onSetMax = useCallback(async () => {
    if (!sender || !api?.market || !recipientAddress || !selectedCurrencyOption) return;
    setIsSetMaxLoading(true);
    try {
      if (isSelectFungibleToken) {
        setAmount(String(sender?.fungibleBalances?.get(selectedCurrencyOption?.id)?.amount));
      } else {
        const recipient = typeof recipientAddress === 'string' ? recipientAddress : recipientAddress?.address;
        const fee = await api?.market?.getTransferBalanceFee(sender.address, recipient, Number(sender.balances?.proper.parsed), { account: sender });
        const amount = Number(sender.balances?.proper.parsed) - Number(fee);
        setFee(fee);
        setAmount(amount > 0 ? ((amount * 10000 | 0) / 10000).toString() : (sender.balances?.proper.parsed || '0'));
      }
    } catch (e) {
      console.error('Failed to get max value: ', e);
    } finally {
      setIsSetMaxLoading(false);
    }
  }, [api, sender, recipientAddress, tokenSymbol, isSelectFungibleToken]);

  const total = useMemo(() => {
    if (!amount || !fee || fee === '0') return null;
    return (Number(amount) + Number(fee)).toFixed(4);
  }, [amount, fee]);

  const onSelectChange = useCallback((value: SelectOptionProps) => {
    const currencySelected = currencyMap.get(value.id as string);
    setSelectedCurrencyOption(currencySelected);
  }, [currencyMap]);

  return (
    <Modal isVisible={isVisible} isClosable={true} onClose={onCloseModal}>
      <Content>
        <Heading size='2' testid={`${testid}-heading`}>
          {'Send funds'}
        </Heading>
      </Content>

      <Text size={'s'} color={'grey-500'}>
        {'From'}
      </Text>
      <SenderSelectWrapper>
        <Dropdown
          optionKey={'address'}
          options={senders as unknown as SelectOptionProps[]}
          onChange={onChangeSender}
          optionRender={(option) => (
            <AddressOptionWrapper>
              <AccountCard
                accountName={(option as unknown as Account)?.name || ''}
                accountAddress={(option as unknown as Account)?.address || ''}
                canCopy
                isShort={deviceSize < DeviceSize.md}
              />
            </AddressOptionWrapper>
          )}
          iconRight={{ name: 'triangle', size: 8 }}
        >
          <AddressWrapper>
            <AccountCard
              accountName={sender?.name || ''}
              accountAddress={sender?.address || ''}
              canCopy
              isShort={deviceSize < DeviceSize.md}
            />
          </AddressWrapper>
        </Dropdown>
      </SenderSelectWrapper>
      <AmountWrapper>
        <Text
          testid={`${testid}-balance`}
          size={'s'}
        >{`${selectedBalance} ${tokenSymbol}`}</Text>
      </AmountWrapper>

      <Text size={'s'} color={'grey-500'}>
        {'To'}
      </Text>
      <RecipientSelectWrapper>
        <SelectInput<Account>
          testid={`${testid}-select-address`}
          options={filteredAccounts as unknown as Account[]}
          value={recipientAddress}
          onChange={onChangeAddress}
          renderOption={(option) => (
            <AddressOptionWrapper>
              <AccountCard
                accountName={option.name || ''}
                accountAddress={option.address}
                canCopy
                isShort={deviceSize < DeviceSize.md}
                testid={`${testid}-selected`}
              />
            </AddressOptionWrapper>
          )}
        />
      </RecipientSelectWrapper>
      <AmountWrapper>
        {recipientAddress && (
          <Text
            testid={`${testid}-recipient-balance`}
            size={'s'}
          >{`${formatBalance(recipientBalance || 0)} ${tokenSymbol}`}</Text>
        )}
      </AmountWrapper>
      {!isValidRecipientAddress && (
        <ErrorWrapper size={'s'} color={'var(--color-coral-500)'}>
          Address is not valid
        </ErrorWrapper>
      )}
      <SelectWrapper
        onChange={onSelectChange}
        options={currencies.map((option) => ({
          id: option.id,
          title: option.title,
          iconLeft: { size: 20, file: option.iconUrl }
        }))}
        value={selectedCurrencyOption?.id || '0'}
        testid={`${testid}-sorting-select`}
        label={'Select currency'}
      >
        {currencies.length <= 1 && (
          <ComingSoon />
        )}
      </SelectWrapper>
      <AmountInputWrapper>
        <NumberInput
          disabled={!recipientAddress || !sender}
          loading={isSetMaxLoading}
          value={amount}
          placeholder={`Amount (${tokenSymbol})`}
          testid={`${testid}-amount-input`}
          onChange={onAmountChange}
          onSetMax={onSetMax}
        />
      </AmountInputWrapper>
      {isAmountGreaterThanBalance && (
        <LowBalanceWrapper>
          <Text size={'s'}>Your balance is too low</Text>
        </LowBalanceWrapper>
      )}
      {!isSelectFungibleToken && !isAmountGreaterThanBalance && isAmountPlusFeeGreaterThanBalance && (
        <LowBalanceWrapper>
          <Text size={'s'}>
            Your balance is insufficient due to transaction fee
          </Text>
        </LowBalanceWrapper>
      )}
      <FeeMessage
        isFeeLoading={isFeeLoading}
        fee={fee}
        placeholder={
          'A fee will be calculated after entering the recipient and amount'
        }
        testid={`${testid}-fee-message`}
      />
      {(total && !isSelectFungibleToken) && (
        <TotalWrapper>
          <Text size='m'>
            Total ~ {total} {tokenSymbol}
          </Text>
        </TotalWrapper>
      )}
      <ButtonWrapper>
        <Button
          testid={`${testid}-confirm-button`}
          disabled={isConfirmDisabled}
          onClick={onSend}
          role='primary'
          title='Confirm'
        />
      </ButtonWrapper>
    </Modal>
  );
};

type TransferFundsStagesModalProps = {
  isVisible: boolean
  onFinish: () => void
  testid: string
};

const TransferFundsStagesModal: FCC<TransferFundsStagesModalProps & TTransferFunds> = ({ isVisible, onFinish, sender, amount, recipient, currency, decimals, testid }) => {
  const { stages, status, initiate } = useTransferFundsStages(sender);
  const { info } = useNotifications();
  useEffect(() => { void initiate({ sender, recipient, amount, currency, decimals }); }, [sender, recipient, amount, currency, decimals]);

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
      row-gap: calc(var(--prop-gap) / 4);
    }
  }
  & .icon-triangle{
    position: absolute;
    top: calc(50% - 4px);
    right: calc(var(--prop-gap) / 2);
  }
`;

const AddressWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--prop-gap) / 2);
  border: 1px solid var(--grey-300);
  border-radius: 4px;
  padding: calc(var(--prop-gap) / 2) var(--prop-gap);
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
  column-gap: calc(var(--prop-gap) / 2);
`;

const TotalWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  column-gap: var(--prop-gap);
  margin-top: calc(var(--prop-gap) * 1.5);
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  column-gap: var(--prop-gap);
  margin-top: calc(var(--prop-gap) * 1.5);
`;

const RecipientSelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--prop-gap) / 2);
  .unique-input-text {
    width: 100%;
  }
`;

const AmountWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const AmountInputWrapper = styled.div`
  margin-top: calc(var(--prop-gap) * 1.5);
  .unique-input-text, div {
    width: 100%;
  }
`;

const ErrorWrapper = styled(Text)`
  margin-top: calc(var(--prop-gap) / 2);
  display: block;
`;

const LowBalanceWrapper = styled(AmountWrapper)`
  position: absolute;
  right: calc(var(--prop-gap) * 1.5);
  span {
    color: ${Coral700} !important;
  }
`;

const SelectWrapper = styled(Select)`
  width: 100%;
  margin: 8px 0 0 0 !important;
`;
