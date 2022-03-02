import React, {FC, useCallback, useEffect, useState} from 'react';
import { Button, Heading, InputText, Select, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { TPlaceABid } from './types';
import { AdditionalWarning100 } from '../../../styles/colors';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { useAuctionBidStages } from '../../../hooks/marketplaceStages';
import { Offer } from '../../../api/restApi/offers/types';
import DefaultMarketStages from './StagesModal';
import Kusama from '../../../static/icons/logo-kusama.svg';

export const AuctionModal: FC<TTokenPageModalBodyProps> = ({ token, offer, setIsClosable, onFinish }) => {
  const [status, setStatus] = useState<'ask' | 'place-bid-stage'>('ask'); // TODO: naming
  const [bidAmount, setBidAmount] = useState<string>('0');

  const onConfirmPlaceABid = useCallback((_bidAmount: string, chain: string) => {
    setBidAmount(_bidAmount);
    setStatus('place-bid-stage');
    setIsClosable(false);
  }, [setStatus, setBidAmount]);

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
}

const chainOptions = [{ id: 'KSM', title: 'KSM', iconRight: { size: 18, file: Kusama } }];

export const AskBidModal: FC<{ offer?: Offer, onConfirmPlaceABid(value: string, chain: string): void}> = ({ offer, onConfirmPlaceABid }) => {
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [chain, setChain] = useState<string | undefined>('KSM');

  const onConfirmPlaceABidClick = useCallback(
    () => {
      const leadingBidAmount = offer?.auction?.bids.reduce((amount, bid) => Math.max(amount, Number(bid.amount)), 0) || 0;

      onConfirmPlaceABid((bidAmount - leadingBidAmount).toString(), chain || '');
    },
    [onConfirmPlaceABid, bidAmount, offer],
  );

  const onBidAmountChange = useCallback(
    (value: number) => {
      setBidAmount(value || 0);
    },
    [setBidAmount],
  );

  const onChainChange = useCallback(
    (value: string) => {
      setChain(value);
    },
    [setChain],
  );

  return (
    <>
      <Content>
        <Heading size='2'>Place a bid</Heading>
      </Content>
      <InputWrapper>
        <SelectStyled options={chainOptions} value={chain} onChange={onChainChange} />
        <InputStyled
          label=''
          onChange={onBidAmountChange}
          value={bidAmount}
        />
      </InputWrapper>
      <Text size={'s'} color={'grey-500'} >
        {`Minimum bid ${offer?.auction?.priceStep} ${chain}`}
      </Text>
      <TextStyled
        color='additional-warning-500'
        size='s'
      >
        A fee of ~ 0.000000000000052 OPL can be applied to the transaction
      </TextStyled>
      <ButtonWrapper>
        <Button
          disabled={!bidAmount}
          onClick={onConfirmPlaceABidClick}
          role='primary'
          title='Confirm'
        />
      </ButtonWrapper>
    </>
  );
};


const AuctionStagesModal: FC<TTokenPageModalBodyProps & TPlaceABid> = ({ token, onFinish, amount }) => {
  const { stages, status, initiate } = useAuctionBidStages(token?.collectionId || 0, token?.id);
  useEffect(() => { initiate({ value: amount }); }, [amount]);
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

const InputStyled = styled(InputText)`
  width: 100%;
  .input-wrapper {
    border-radius: 0 4px 4px 0;
    border-left: 0 solid;
    height: 38px;
  }
`;

const TextStyled = styled(Text)`
  margin-top: calc(var(--gap) * 2);
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

const Content = styled.div`
  && h2 {
    margin-bottom: 0;
  }
`;
