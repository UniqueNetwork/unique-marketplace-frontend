import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { CollectionInfoWithSchemaResponse, TokenByIdResponse } from '@unique-nft/sdk';
import { Address } from '@unique-nft/utils';
import { Heading, Link, useNotifications, Button, Text } from 'components/UI';
import { BN } from '@polkadot/util';
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
import { fromStringToBnString } from 'utils/bigNum';
import { NumberInput } from 'components/NumberInput/NumberInput';
import { formatBlockNumber } from 'utils/textUtils';

export const TransferModal: FC<TTokenPageModalBodyProps> = ({ token, setIsClosable, onFinish, testid, collection }) => {
  const { selectedAccount } = useAccounts();
  const [status, setStatus] = useState<'ask' | 'transfer-stage'>('ask'); // TODO: naming
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<number>(1);

  const onTransfer = useCallback((_recipient: string, amount: number) => {
    setRecipient(_recipient);
    setAmount(amount);
    setStatus('transfer-stage');
    setIsClosable(false);
  }, [setStatus, setRecipient, setIsClosable]);

  if (!selectedAccount) return null;

  if (status === 'ask') {
 return (<AskTransferModal
   token={token}
   collection={collection}
   onTransfer={onTransfer}
   testid={`${testid}-ask-transfer`}
 />);
}
  if (status === 'transfer-stage') {
    return (<TransferStagesModal
      recipient={recipient}
      amount={amount}
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
  collection?: CollectionInfoWithSchemaResponse | null
  onTransfer(receiver: string, amount: number): void
  testid: string
}

const AskTransferModal: FC<AskTransferModalProps> = ({ token, collection, onTransfer, testid }) => {
  const { api, chainProperties } = useApi();
  const { selectedAccount } = useAccounts();
  const [address, setAddress] = useState<string>('');
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [isFeeLoading, setIsFeeLoading] = useState(false);
  const [fee, setFee] = useState<string>('0');
  const [isSponsored, setIsSponsored] = useState(false);
  const [amount, setAmount] = useState('1');
  const [totalAmount, setTotalAmount] = useState(0);
  const [isFetchingAmount, setIsFetchingAmount] = useState(false);

  useEffect(() => {
    if (!token?.collectionId || !selectedAccount?.address) return;
    void (async () => {
      setIsFeeLoading(true);
      const collection = await api?.collection?.getCollection(token?.collectionId);
      setIsSponsored(!!collection?.sponsorship?.isConfirmed);
      setIsFeeLoading(false);
      if (collection?.mode === 'ReFungible') {
        setIsFetchingAmount(true);
        const totalAmount = await api?.rft?.getTokenBalance(token.collectionId, token.tokenId, selectedAccount?.address);
        setTotalAmount(totalAmount?.amount || 0);
        setIsFetchingAmount(false);
      }
    })();
  }, [token?.collectionId, selectedAccount?.address]);

  const getFee = useCallback((recipient: string) => {
    setIsFeeLoading(true);
    return debounce(() => {
      if (!api?.market ||
          !token ||
          !selectedAccount ||
          !recipient ||
          recipient === selectedAccount.address ||
          isSponsored) return setIsFeeLoading(false);
      const sender = Address.is.ethereumAddress(selectedAccount.address)
        ? selectedAccount.address
        : Address.normalize.substrateAddress(selectedAccount.address, chainProperties?.SS58Prefix);

      api?.market?.getTransferTokenFee(
        sender,
        recipient,
        token.collectionId,
        token.tokenId,
        collection?.mode || 'NFT',
        Number(amount),
        { account: selectedAccount })
      .then((fee) => {
        setFee(fee || '0');
      }).catch((e) => {
        console.error('Failed to get fee: ', e);
      }).finally(() => {
        setIsFeeLoading(false);
      });
    }, 300);
  }, [api?.market, amount, token, selectedAccount, isSponsored, collection?.mode, chainProperties?.SS58Prefix]);

  const onAddressInputChange = useCallback((value: string) => {
    setAddress(value);
    const isOwnerAddress = selectedAccount?.address && (Address.compare.substrateAddresses(value, selectedAccount?.address) || Address.compare.ethereumAddresses(value, selectedAccount?.address));
    if ((Address.is.ethereumAddress(value) || Address.is.substrateAddress(value)) && !isOwnerAddress) {
      getFee(value)();
      setIsAddressValid(true);
    } else {
      setIsAddressValid(false);
    }
  }, [selectedAccount]);

  const onConfirmTransferClick = useCallback(
    () => {
      if (!address) return;
      onTransfer(address, Number(amount));
    },
    [address, onTransfer, amount]
  );

  const isFeeGreaterThanBalance = useMemo(() => {
    if (!fee || isSponsored) return false;
    const feeBN = new BN(fromStringToBnString(fee));
    return feeBN.gt(selectedAccount?.balances?.proper.raw || new BN(0));
  }, [fee, selectedAccount?.balances, isSponsored]);

  const onSetMaxAmount = useCallback(() => setAmount(totalAmount.toString()), [totalAmount]);
  const isAmountValid = useMemo(() => {
    if (collection?.mode !== 'ReFungible') return true;
    return amount && amount !== '0' && Number(amount) <= totalAmount;
  }, [amount, totalAmount, collection]);
  return (
    <>
      <Content>
        <Heading size='2'>Transfer token</Heading>
      </Content>
      {collection?.mode === 'ReFungible' && <AmountInputWrapper>
        <AmountInputStyled
          loading={isFetchingAmount}
          label='Number of fractions to be sent'
          additionalText={isFetchingAmount ? 'Loading...' : `You own: ${formatBlockNumber(totalAmount)}`}
          value={amount.toString()}
          onChange={setAmount}
          onSetMax={onSetMaxAmount}
        />
        {!isAmountValid && <InvalidAddressWrapper>
          <Text size={'s'}>Invalid number of fractions</Text>
        </InvalidAddressWrapper>}
      </AmountInputWrapper>}
      <InputStyled
        label='Please enter the address you wish to send the token to'
        onChange={onAddressInputChange}
        value={address}
        testid={`${testid}-address-input`}
      />
      {(isFeeGreaterThanBalance) && <LowBalanceWrapper>
        <Text size={'s'}>Your balance is insufficient due to transaction fee</Text>
      </LowBalanceWrapper>}
      {!isAddressValid && address && <InvalidAddressWrapper>
        <Text size={'s'}>Entered address is not valid</Text>
      </InvalidAddressWrapper>}
      <WarningBlock>
        Proceed with caution, once confirmed the transaction cannot be reverted.
      </WarningBlock>
      <FeeMessage
        isFeeLoading={isFeeLoading}
        fee={fee || '0'}
        testid={`${testid}-fee-message`}
        placeholder={isSponsored ? `Collection ID ${collection?.id} sponsored` : undefined}
      />
      <ButtonWrapper>
        <Button
          disabled={!address || isFeeGreaterThanBalance || !isAddressValid || !isAmountValid}
          onClick={onConfirmTransferClick}
          role='primary'
          title='Confirm'
          testid={`${testid}-confirm-button`}
        />
      </ButtonWrapper>
    </>
  );
};

const TransferStagesModal: FC<TTokenPageModalBodyProps & TTransfer> = ({ token, collection, onFinish, sender, amount, recipient, testid }) => {
  const { stages, status, initiate } = useTransferStages(token?.collectionId || 0, token?.tokenId || 0, collection?.mode || 'NFT');
  const { info } = useNotifications();

  useEffect(() => {
    initiate({ sender, recipient, amount });
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

const InputStyled = styled(TextInput)`
  margin-bottom: 8px;
  width: 100%;

  label {
    margin-bottom: 16px;    
    white-space: break-spaces;
    height: auto;
  }
`;

const AmountInputWrapper = styled.div`
  width: 100%;
  margin-bottom: calc(var(--gap) * 2);
`;

const AmountInputStyled = styled(NumberInput)`
  width: 100%;
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

const InvalidAddressWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  right: calc(var(--gap) * 1.5);
  height: 0;
  span {
    color: ${Coral700} !important;
  }
`;

const LowBalanceWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  right: calc(var(--gap) * 1.5);
  span {
    color: ${Coral700} !important;
  }
`;
