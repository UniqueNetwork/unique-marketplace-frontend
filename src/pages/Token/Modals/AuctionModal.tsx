import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Heading, Link, Select, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';
import { BN } from '@polkadot/util';

import { TPlaceABid } from './types';
import DefaultMarketStages from './StagesModal';
import { AdditionalWarning100 } from '../../../styles/colors';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { useAuctionBidStages } from '../../../hooks/marketplaceStages';
import { useAccounts } from '../../../hooks/useAccounts';
import { useFee } from '../../../hooks/useFee';
import { useNotification } from '../../../hooks/useNotification';
import { useApi } from '../../../hooks/useApi';
import { formatKusamaBalance } from '../../../utils/textUtils';
import { fromStringToBnString } from '../../../utils/bigNum';
import { NumberInput } from '../../../components/NumberInput/NumberInput';
import { StageStatus } from '../../../types/StagesTypes';
import { Offer } from '../../../api/restApi/offers/types';
import { useAuction } from '../../../api/restApi/auction/auction';
import { TCalculatedBid } from '../../../api/restApi/auction/types';
import { NotificationSeverity } from '../../../notification/NotificationContext';
import Kusama from '../../../static/icons/logo-kusama.svg';

export const AuctionModal: FC<TTokenPageModalBodyProps> = ({ offer, setIsClosable, onFinish }) => {
  const [status, setStatus] = useState<'ask' | 'place-bid-stage'>('ask'); // TODO: naming
  const [bidValue, setBidValue] = useState<TPlaceABid>();

  const onConfirmPlaceABid = useCallback((_bidValue: TPlaceABid) => {
    setBidValue(_bidValue);
    setStatus('place-bid-stage');
    setIsClosable(false);
  }, [setStatus, setBidValue, setIsClosable]);

  if (status === 'ask') return (<AskBidModal offer={offer} onConfirmPlaceABid={onConfirmPlaceABid} />);
  if (status === 'place-bid-stage') {
    return (<AuctionStagesModal
      accountAddress={bidValue?.accountAddress}
      amount={bidValue?.amount}
      onFinish={onFinish}
      offer={offer}
      setIsClosable={setIsClosable}
    />);
  }
  return null;
};

const chainOptions = [{ id: 'KSM', title: 'KSM', iconRight: { size: 18, file: Kusama } }];

export const AskBidModal: FC<{ offer?: Offer, onConfirmPlaceABid(value: TPlaceABid): void}> = ({ offer, onConfirmPlaceABid }) => {
  const [chain, setChain] = useState<string | undefined>('KSM');
  const { kusamaFee } = useFee();
  const { selectedAccount } = useAccounts();
  const { api } = useApi();
  const [calculatedBid, setCalculatedBid] = useState<TCalculatedBid>();

  const { getCalculatedBid } = useAuction();

  useEffect(() => {
    if (!offer || !selectedAccount) return;
    (async () => {
      const _calculatedBid = await getCalculatedBid({
        collectionId: offer.collectionId || 0,
        tokenId: offer?.tokenId || 0,
        bidderAddress: selectedAccount?.address || ''
      });
      setCalculatedBid(_calculatedBid);
    })();
  }, [offer, selectedAccount]);

  const leadingBid = useMemo(() => {
    if (!offer?.auction?.bids || offer?.auction?.bids.length === 0) return 0;
    return offer?.auction?.bids[0].balance;
  }, [offer]);

  const lastBidFromThisAccount = calculatedBid?.bidderPendingAmount;

  const minimalBid = useMemo(() => {
    if (!leadingBid) return new BN(offer?.auction?.startPrice || offer?.auction?.priceStep || 0);
    return new BN(Number(leadingBid) + Number(offer?.auction?.priceStep || '0'));
  }, [offer?.auction, leadingBid]);

  const [bidAmount, setBidAmount] = useState<string>(formatKusamaBalance(minimalBid.toString(), api?.market?.kusamaDecimals));

  const isEnoughBalance = useMemo(() => {
    if (!selectedAccount?.balance?.KSM || selectedAccount?.balance?.KSM.isZero()) return false;
    const bnAmount = new BN(fromStringToBnString(bidAmount, api?.market?.kusamaDecimals));
    return selectedAccount?.balance?.KSM.gte(bnAmount.sub(new BN(lastBidFromThisAccount || 0)));
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

      onConfirmPlaceABid({
        accountAddress: selectedAccount?.address || '',
        amount: formatKusamaBalance(Number(bnAmount.toString()) - Number(lastBidFromThisAccount))
      });
    },
    [onConfirmPlaceABid, bidAmount, isEnoughBalance, isAmountValid, chain, api?.market?.kusamaDecimals, lastBidFromThisAccount]
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
        {`A fee of ~ ${kusamaFee} ${chain || ''} can be applied to the transaction`}
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

const AuctionStagesModal: FC<TTokenPageModalBodyProps & TPlaceABid> = ({ offer, accountAddress, onFinish, amount }) => {
  const { stages, status, initiate } = useAuctionBidStages(offer?.collectionId || 0, offer?.tokenId || 0);
  const { push } = useNotification();

  useEffect(() => {
    if (!amount || !accountAddress) return;
    initiate({ value: amount, accountAddress });
  }, [amount, accountAddress]);

  const { tokenId, collectionId } = offer || {};
  const { prefix } = offer?.tokenDescription || {};

  useEffect(() => {
    if (status === StageStatus.success) {
      push({ severity: NotificationSeverity.success, message: <>You made a new bid on <Link href={`/token/${collectionId || ''}/${tokenId || ''}`} title={`${prefix || ''} #${tokenId || ''}`}/></> });
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
