import React, {FC, useCallback, useEffect, useMemo, useState} from 'react';
import { TPlaceABid } from './types';
import { Button, Heading, InputText, Select, Text } from "@unique-nft/ui-kit";
import styled from "styled-components/macro";
import { AdditionalWarning100 } from "../../../styles/colors";
import { TTokenPageModalBodyProps } from "./TokenPageModal";
import { useAuctionBidStages } from "../../../hooks/marketplaceStages";
import DefaultMarketStages from "./StagesModal";
import {Offer} from "../../../api/restApi/offers/types";

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

export const AskBidModal: FC<{ offer?: Offer, onConfirmPlaceABid(bidAmount: string, chain: string): void}> = ({ offer, onConfirmPlaceABid }) => {
  const [bidAmount, setBidAmount] = useState<string>('0');
  const [chain, setChain] = useState<string | undefined>('KSM');

  const onConfirmPlaceABidClick = useCallback(
    () => {
      onConfirmPlaceABid(bidAmount, chain || '');
    },
    [onConfirmPlaceABid, bidAmount],
  );

  const onBidAmountChange = useCallback(
    (value: string) => {
      setBidAmount(value);
    },
    [setBidAmount],
  );

  const onChainChange = useCallback(
    (value: string) => {
      setChain(value);
    },
    [setChain],
  );

  const minimumAmount = useMemo(() => {
    return 0; // TODO: calculate a minimum bid amount
  }, [offer])

  return (
    <>
      <Content>
        <Heading size='2'>Place a bid</Heading>
      </Content>
      <InputWrapper >
        <Select options={[{ id: 'KSM', title: 'KSM' }]} value={chain} onChange={onChainChange} />
        <InputStyled
          label=''
          onChange={onBidAmountChange}
          value={bidAmount}
        />
      </InputWrapper>
      <Text >
        {`Minimum bid ${minimumAmount} ${chain}`}
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
  
`;

const TextStyled = styled(Text)`
  box-sizing: border-box;
  display: flex;
  padding: 8px 16px;
  margin-bottom: 24px;
  border-radius: 4px;
  background-color: ${AdditionalWarning100};
  width: 100%;
`;

const InputStyled = styled(InputText)`
  margin-bottom: 32px;
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