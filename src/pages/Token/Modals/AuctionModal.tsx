import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Heading, Link, Select, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { TPlaceABid } from './types';
import { AdditionalWarning100 } from '../../../styles/colors';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { useAuctionBidStages } from '../../../hooks/marketplaceStages';
import { Offer } from '../../../api/restApi/offers/types';
import DefaultMarketStages from './StagesModal';
import Kusama from '../../../static/icons/logo-kusama.svg';
import { useAccounts } from '../../../hooks/useAccounts';
import { formatKusamaBalance } from '../../../utils/textUtils';
import { NumberInput } from '../../../components/NumberInput/NumberInput';
import { useApi } from '../../../hooks/useApi';
import { fromStringToBnString } from '../../../utils/bigNum';
import { BN } from '@polkadot/util';
import { StageStatus } from '../../../types/StagesTypes';
import { NotificationSeverity } from '../../../notification/NotificationContext';
import { useNotification } from '../../../hooks/useNotification';

export const AuctionModal: FC<TTokenPageModalBodyProps> = ({ token, offer, setIsClosable, onFinish }) => {
  const [status, setStatus] = useState<'ask' | 'place-bid-stage'>('ask'); // TODO: naming
  const [bidAmount, setBidAmount] = useState<string>('0');

  const onConfirmPlaceABid = useCallback((_bidAmount: string) => {
    setBidAmount(_bidAmount);
    setStatus('place-bid-stage');
    setIsClosable(false);
  }, [setStatus, setBidAmount, setIsClosable]);

  if (status === 'ask') return (<AskBidModal offer={offer} onConfirmPlaceABid={onConfirmPlaceABid} />);
  if (status === 'place-bid-stage') {
    return (<AuctionStagesModal
      amount={bidAmount}
      onFinish={onFinish}
      token={token}
      setIsClosable={setIsClosable}
    />);
  }
  return null;
};

const chainOptions = [{ id: 'KSM', title: 'KSM', iconRight: { size: 18, file: Kusama } }];

export const AskBidModal: FC<{ offer?: Offer, onConfirmPlaceABid(value: string, chain: string): void}> = ({ offer, onConfirmPlaceABid }) => {
  const [bidAmount, setBidAmount] = useState<string>('0');
  const [chain, setChain] = useState<string | undefined>('KSM');
  const { selectedAccount } = useAccounts();
  const { api } = useApi();

  const leadingBidAmount = useMemo(() => {
    if (!offer?.auction?.bids || offer?.auction?.bids.length === 0) return new BN(offer?.auction?.startPrice || 0);
    return new BN(offer?.auction?.bids[0].balance);
  }, [offer]);

  const minimalBid = useMemo(() => {
    if (!offer?.auction?.bids || offer?.auction?.bids.length === 0) return leadingBidAmount;
    return leadingBidAmount.add(new BN(offer?.auction?.priceStep || 0));
  }, [leadingBidAmount, offer?.auction?.priceStep, offer?.auction?.bids]);

  const isEnoughBalance = useMemo(() => {
    if (!selectedAccount?.balance?.KSM || selectedAccount?.balance?.KSM.isZero()) return false;
    const bnAmount = new BN(fromStringToBnString(bidAmount, api?.market?.kusamaDecimals));
    return selectedAccount?.balance?.KSM.gte(bnAmount);
  }, [selectedAccount?.balance?.KSM, bidAmount, api?.market?.kusamaDecimals]);

  const onBidAmountChange = useCallback((value: string) => {
    setBidAmount(value);
  }, [setBidAmount]);

  const isAmountValid = useMemo(() => {
    if (!bidAmount || bidAmount === '0') return false;
    return new BN(fromStringToBnString(bidAmount, api?.market?.kusamaDecimals)).gte(minimalBid);
  }, [bidAmount, minimalBid, api?.market?.kusamaDecimals]);

  const onConfirmPlaceABidClick = useCallback(
    () => {
      if (!isAmountValid || !isEnoughBalance) return;
      const bnAmount = new BN(fromStringToBnString(bidAmount, api?.market?.kusamaDecimals));

      // const difference = formatKusamaBalance(bnAmount.sub(leadingBidAmount).toString());

      onConfirmPlaceABid(formatKusamaBalance(bnAmount.toString()), chain || '');
    },
    [onConfirmPlaceABid, bidAmount, isEnoughBalance, isAmountValid, leadingBidAmount, chain, api?.market?.kusamaDecimals]
  );

  const onChainChange = useCallback(
    (value: string) => {
      setChain(value);
    },
    [setChain]
  );

  return (
    <>
      <Content>
        <Heading size='2'>Place a bid</Heading>
      </Content>
      <InputWrapper>
        <SelectStyled options={chainOptions} value={chain} onChange={onChainChange} />
        <InputStyled
          onChange={onBidAmountChange}
          value={bidAmount.toString()}
        />
      </InputWrapper>
      <Text size={'s'} color={'grey-500'} >
        {`Minimum bid ${formatKusamaBalance(minimalBid.toString(), api?.market?.kusamaDecimals)} ${chain || ''}`}
      </Text>
      <CautionTextWrapper>
        {!isEnoughBalance && <Text color={'coral-500'}>Your balance is too low to place a bid</Text>}
      </CautionTextWrapper>
      <TextStyled
        color='additional-warning-500'
        size='s'
      >
        {`A fee of ~ 0.000000000000052 ${chain || ''} can be applied to the transaction`}
      </TextStyled>
      <ButtonWrapper>
        <Button
          disabled={!isAmountValid || !isEnoughBalance}
          onClick={onConfirmPlaceABidClick}
          role='primary'
          title='Confirm'
        />
      </ButtonWrapper>
    </>
  );
};

const AuctionStagesModal: FC<TTokenPageModalBodyProps & TPlaceABid> = ({ token, onFinish, amount }) => {
  const { selectedAccount } = useAccounts();
  const { stages, status, initiate } = useAuctionBidStages(token?.collectionId || 0, token?.id);
  const { push } = useNotification();

  useEffect(() => {
    if (!selectedAccount) throw new Error('Account not selected');
    initiate({ value: amount, accountAddress: selectedAccount.address });
  }, [amount, selectedAccount]);

  useEffect(() => {
    if (status === StageStatus.success) {
      push({ severity: NotificationSeverity.success, message: <>You made a new bid on <Link title={`${token.prefix} #${token.id}`}/></> });
    }
  }, [status]);

  return (
    <div>
      <DefaultMarketStages stages={stages} status={status} onFinish={onFinish} />
    </div>
  );
};

const InputWrapper = styled.div`
  display: flex;
  margin-top: calc(var(--gap) * 2);
  margin-bottom: calc(var(--gap) / 2);
`;

const SelectStyled = styled(Select)`
  width: 120px;
  .select-value {
    border-radius: 4px 0 0 4px !important;
  }
`;

const InputStyled = styled(NumberInput)`
  width: 100%;
  .input-wrapper {
    border-radius: 0 4px 4px 0;
    border-left: 0 solid;
    height: 38px;
  }
`;

const TextStyled = styled(Text)`
  margin-top: calc(var(--gap) / 2);
  box-sizing: border-box;
  display: flex;
  padding: 8px 16px;
  margin-bottom: 24px;
  border-radius: 4px;
  background-color: ${AdditionalWarning100};
  width: 100%;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const CautionTextWrapper = styled.div`
  display: flex;
  min-height: calc(var(--gap) * 1.5);
`;

const Content = styled.div`
  && h2 {
    margin-bottom: 0;
  }
`;
