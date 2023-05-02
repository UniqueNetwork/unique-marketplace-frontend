import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Heading, Link, SelectOptionProps } from '@unique-nft/ui-kit';
import { Text, useNotifications, Select, Button } from 'components/UI';
import styled from 'styled-components';
import { BN } from '@polkadot/util';
import { TPlaceABid } from './types';
import DefaultMarketStages from './StagesModal';
import { AdditionalWarning100, Coral100 } from 'styles/colors';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { useAuctionBidStages } from 'hooks/marketplaceStages';
import { useAccounts } from 'hooks/useAccounts';
import { useFee } from 'hooks/useFee';
import { useApi } from 'hooks/useApi';
import { formatKusamaBalance } from 'utils/textUtils';
import { fromStringToBnString } from 'utils/bigNum';
import { NumberInput } from 'components/NumberInput/NumberInput';
import { StageStatus } from 'types/StagesTypes';
import { Offer } from 'api/restApi/offers/types';
import { useAuction } from 'api/restApi/auction/auction';
import { TCalculatedBid } from 'api/restApi/auction/types';

export const AuctionModal: FC<TTokenPageModalBodyProps> = ({ offer, setIsClosable, onFinish, testid }) => {
  const [status, setStatus] = useState<'ask' | 'place-bid-stage'>('ask'); // TODO: naming
  const [bidValue, setBidValue] = useState<TPlaceABid>();

  const onConfirmPlaceABid = useCallback((_bidValue: TPlaceABid) => {
    setBidValue(_bidValue);
    setStatus('place-bid-stage');
    setIsClosable(false);
  }, [setStatus, setBidValue, setIsClosable]);

  if (status === 'ask') return (<AskBidModal offer={offer} onConfirmPlaceABid={onConfirmPlaceABid} testid={`${testid}-bid`} />);
  if (status === 'place-bid-stage') {
    return (<AuctionStagesModal
      accountAddress={bidValue?.accountAddress}
      amount={bidValue?.amount}
      onFinish={onFinish}
      offer={offer}
      setIsClosable={setIsClosable}
      testid={`${testid}-stages`}
    />);
  }
  return null;
};

const chainOptions = [{ id: 'KSM', title: '!!!OLD_KSM!!!', iconRight: { size: 18, name: 'chain-kusama' } }];

export const AskBidModal: FC<{ offer?: Offer, onConfirmPlaceABid(value: TPlaceABid): void, testid: string}> = ({ offer, onConfirmPlaceABid, testid }) => {
  const { api, settings } = useApi();
  const [chain, setChain] = useState<string | undefined>('KSM');
  const { kusamaFee, getFee } = useFee();
  const { selectedAccount } = useAccounts();
  const [calculatedBid, setCalculatedBid] = useState<TCalculatedBid>();
  const [isFetchingCalculatedbid, setIsFetchingCalculatedBid] = useState<boolean>(true);
  const { getCalculatedBid } = useAuction();
  const decimals = api?.market?.decimals;

  const fetchCalculatedBid = useCallback(async () => {
    if (!offer || !selectedAccount || !settings) return;
    setIsFetchingCalculatedBid(true);
    const _calculatedBid = await getCalculatedBid({
      collectionId: offer?.collectionId || 0,
      tokenId: offer?.tokenId || 0,
      bidderAddress: selectedAccount?.address || ''
    });
    await getFee(settings.auction.address, new BN(_calculatedBid?.minBidderAmount || 0));
    setCalculatedBid(_calculatedBid);
    setIsFetchingCalculatedBid(false);
  }, [offer, selectedAccount?.address]);

  useEffect(() => {
    void fetchCalculatedBid();
  }, [fetchCalculatedBid]);

  const leadingBid = useMemo(() => {
    if (!offer?.auction?.bids || offer?.auction?.bids.length === 0) return 0;
    return offer?.auction?.bids[0].balance;
  }, [offer]);

  const lastBidFromThisAccount = calculatedBid?.bidderPendingAmount;

  const minimalBid = useMemo(() => {
    if (!leadingBid) return new BN(offer?.auction?.startPrice || offer?.auction?.priceStep || 0);
    return new BN(Number(leadingBid) + Number(offer?.auction?.priceStep || '0'));
  }, [offer?.auction, leadingBid]);

  const [bidAmount, setBidAmount] = useState<string>(formatKusamaBalance(minimalBid.toString(), { decimals }));

  const isEnoughBalance = useMemo(() => {
    if (!selectedAccount?.balance?.raw || selectedAccount?.balance?.raw.isZero()) return false;
    const bnAmount = new BN(fromStringToBnString(bidAmount, api?.market?.decimals));
    return selectedAccount?.balance?.raw.gte(bnAmount.sub(new BN(lastBidFromThisAccount || 0)));
  }, [selectedAccount?.balance?.raw, bidAmount, api?.market?.decimals, lastBidFromThisAccount]);

  const onBidAmountChange = useCallback((value: string) => {
    setBidAmount(value);
    if (!settings) return;
    void (getFee(settings.auction.address, new BN(fromStringToBnString(value, api?.market?.decimals))));
  }, [setBidAmount, api, getFee, settings]);

  const isAmountValid = useMemo(() => {
    if (!bidAmount || bidAmount === '0') return false;
    return new BN(fromStringToBnString(bidAmount, api?.market?.decimals)).gte(minimalBid);
  }, [bidAmount, minimalBid, api?.market?.decimals]);

  const onConfirmPlaceABidClick = useCallback(
    () => {
      if (!isAmountValid || !isEnoughBalance) return;
      const bnAmount = new BN(fromStringToBnString(bidAmount, api?.market?.decimals));

      onConfirmPlaceABid({
        accountAddress: selectedAccount?.address || '',
        amount: formatKusamaBalance(Number(bnAmount.toString()) - Number(lastBidFromThisAccount))
      });
    },
    [onConfirmPlaceABid, bidAmount, isEnoughBalance, isAmountValid, chain, api?.market?.decimals, lastBidFromThisAccount]
  );

  const onChainChange = useCallback(
    (value: SelectOptionProps) => {
      setChain(value.id as string);
    },
    [setChain]
  );

  return (
    <div data-testid={testid}>
      <Content>
        <Heading size='2' testid={`${testid}-heading`}>Place a bid</Heading>
      </Content>
      <InputWrapper>
        <SelectStyled
          options={chainOptions}
          value={chain}
          onChange={onChainChange}
          testid={`${testid}-currency-select`}
        />
        <InputStyled
          onChange={onBidAmountChange}
          value={bidAmount.toString()}
          testid={`${testid}-amount`}
        />
      </InputWrapper>
      <Text size={'s'} color={'grey-500'} testid={`${testid}-minimum-bid-text`}>
        {`Minimum bid ${formatKusamaBalance(minimalBid.toString(), { decimals })} ${chain || ''}`}
      </Text>
      <CautionTextWrapper>
        {(!isEnoughBalance || !isAmountValid) && <WarningStyled color={'coral-500'} testid={`${testid}-low-balance-warning`}>Check the bid. You may haven’t enough funds or the entered value is less than the minimum or previous bid.</WarningStyled>}
        {(isEnoughBalance && isAmountValid) && <TextStyled
          color='additional-warning-500'
          size='s'
          testid={`${testid}-fee-warning`}
        >
          {`A fee of ~ ${kusamaFee} ${chain || ''} can be applied to the transaction`}
        </TextStyled>}
      </CautionTextWrapper>
      <ButtonWrapper>
        <Button
          disabled={!isAmountValid || !isEnoughBalance || isFetchingCalculatedbid}
          onClick={onConfirmPlaceABidClick}
          role='primary'
          title='Confirm'
          testid={`${testid}-confirm-button`}
        />
      </ButtonWrapper>
    </div>
  );
};

const AuctionStagesModal: FC<TTokenPageModalBodyProps & TPlaceABid> = ({ offer, accountAddress, onFinish, amount }) => {
  const { stages, status, initiate } = useAuctionBidStages(offer?.collectionId || 0, offer?.tokenId || 0);
  const { info } = useNotifications();

  useEffect(() => {
    if (!amount || !accountAddress) return;
    initiate({ value: fromStringToBnString(amount), accountAddress });
  }, [amount, accountAddress]);

  const { tokenId, collectionId } = offer || {};
  const { tokenPrefix } = offer?.collectionDescription || {};

  useEffect(() => {
    if (status === StageStatus.success) {
      info(
        <>You made a new bid on <Link href={`/token/${collectionId || ''}/${tokenId || ''}`} title={`${tokenPrefix || ''} #${tokenId || ''}`}/></>,
        { name: 'success', size: 32, color: 'var(--color-additional-light)' }
      );
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
  box-sizing: border-box;
  display: flex;
  padding: 8px 16px;
  margin: 32px 0 24px;
  border-radius: 4px;
  background-color: ${AdditionalWarning100};
  width: 100%;
`;

const WarningStyled = styled(TextStyled)`
  background-color: ${Coral100};
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const CautionTextWrapper = styled.div`
  display: flex;
  min-height: calc(var(--gap) * 2);
`;

const Content = styled.div`
  && h2 {
    margin-bottom: 0;
  }
`;
