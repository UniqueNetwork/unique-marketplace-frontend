import { Button, Heading, Tabs, Text, Select, InputText } from '@unique-nft/ui-kit';
import { FC, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components/macro';

import DefaultMarketStages from './StagesModal';
import { TAuctionProps, TFixPriceProps } from './types';
import { useAuctionSellStages, useSellFixStages } from '../../../hooks/marketplaceStages';
import { AdditionalColorDark, AdditionalWarning100 } from '../../../styles/colors';
import { TTokenPageModalBodyProps } from './TokenPageModal';

// TODO: take from config instead (/api/settings inside ApiContext)
const getFees = () => {
  const priceFee = 0.1;
  const stepFee = 0.1;
  return { priceFee, stepFee };
};

const tokenSymbol = 'KSM';

export const SellModal: FC<TTokenPageModalBodyProps> = ({ token, offer, onFinish, setIsClosable }) => {
  const { collectionId, id: tokenId } = token;
  const [status, setStatus] = useState<'ask' | 'auction-stage' | 'fix-price-stage'>('ask'); // TODO: naming
  const [auction, setAuction] = useState<TAuctionProps>();
  const [fixPrice, setFixPrice] = useState<TFixPriceProps>();

  const onSellAuction = useCallback((auction: TAuctionProps) => {
      setAuction(auction);
      setStatus('auction-stage');
      setIsClosable(false);
  }, [setStatus, setAuction]);

  const onSellFixPrice = useCallback((fixPrice: TFixPriceProps) => {
    setFixPrice(fixPrice);
    setStatus('fix-price-stage');
    setIsClosable(false);
  }, [setStatus, setFixPrice]);

  if (status === 'ask') return (<AskSellModal onSellAuction={onSellAuction} onSellFixPrice={onSellFixPrice} />);
  switch (status) {
    case 'auction-stage':
      return (<SellAuctionStagesModal collectionId={collectionId || 0}
        tokenId={tokenId}
        auction={auction as TAuctionProps}
        onFinish={onFinish}
      />);
    case 'fix-price-stage':
      return (<SellFixStagesModal collectionId={collectionId || 0}
        tokenId={tokenId}
        sellFix={fixPrice as TFixPriceProps}
        onFinish={onFinish}
      />);
    default: throw new Error(`Incorrect status provided for processing modal: ${status}`);
  }
};

type TOnSellAuction = (auction: TAuctionProps) => void;
type TOnSellFix = (price: TFixPriceProps) => void;
type TAskSellModalProps = {
  onSellAuction: TOnSellAuction,
  onSellFixPrice: TOnSellFix,
}

export const AskSellModal: FC<TAskSellModalProps> = ({ onSellAuction, onSellFixPrice }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [priceInputValue, setpriceInputValue] = useState<number>(15);

  const [minStepInputValueAuction, setMinStepInputValueAuction] = useState<number>(15);
  const [inputStartingPriceValue, setInputStartingPriceValue] = useState<number>();
  const [durationSelectValue, setDurationSelectValue] = useState<number>();

  const { priceFee, stepFee } = getFees();

  const handleClick = useCallback(
    (tabIndex: number) => {
      setActiveTab(tabIndex);
    },
    [setActiveTab]
  );

  const onPriceInputChange = useCallback(
    (value: number) => {
      setpriceInputValue(value);
    },
    [setpriceInputValue]
  );

  const onConfirmAuctionClick = useCallback(() => {
    onSellAuction({ minimumStep: minStepInputValueAuction, startingPrice: inputStartingPriceValue, duration: durationSelectValue } as TAuctionProps);
  }, [minStepInputValueAuction, inputStartingPriceValue, durationSelectValue]);

  const onConfirmFixPriceClick = useCallback(() => {
    onSellFixPrice({ price: priceInputValue } as TFixPriceProps); // TODO: proper typing, proper calculated object
  }, [priceInputValue]);

  const onMinStepInputChange = useCallback(
    (value: number) => {
      setMinStepInputValueAuction(value);
    },
    [setMinStepInputValueAuction]
  );

  const onInputStartingPriceChange = useCallback(
    (value: number) => {
      setInputStartingPriceValue(value);
    },
    [setInputStartingPriceValue]
  );

  const onDurationSelectChange = useCallback(
    (value: string) => {
      // TODO; trim/parse for string
      setDurationSelectValue(Number(value));
    },
    [setDurationSelectValue]
  );

  const durationOptions = [
    {
      id: 3,
      title: '3 days'
    },
    {
      id: 7,
      title: '7 days'
    },
    {
      id: 14,
      title: '14 days'
    },
    {
      id: 21,
      title: '21 days'
    }
  ];

  const FixedPriceTab = (
    <>
      <InputWrapper
        label='Price*'
        onChange={onPriceInputChange}
        value={priceInputValue}
      />
      <TextStyled
        color='additional-warning-500'
        size='s'
      >
        {`A fee of ~ 0.000000000000052 ${tokenSymbol} can be applied to the transaction`}
      </TextStyled>
      <ButtonWrapper>
        <Button
          disabled={!priceInputValue}
          onClick={onConfirmFixPriceClick}
          role='primary'
          title='Confirm'
        />
      </ButtonWrapper>
    </>
  );

  const AuctionTab = (
    <>
      <InputWrapper
        label='Minimum step*'
        onChange={onMinStepInputChange}
        value={minStepInputValueAuction}
      />
      <Row>
        <InputWrapper
          label='Starting Price'
          onChange={onInputStartingPriceChange}
          value={inputStartingPriceValue}
        />
        <SelectWrapper
          label='Duration*'
          onChange={onDurationSelectChange}
          options={durationOptions}
          value={durationSelectValue}
        />
      </Row>
      <TextStyled
        color='additional-warning-500'
        size='s'
      >
        {`A fee of ~ 0.000000000000052 ${tokenSymbol} can be applied to the transaction`}
      </TextStyled>
      <ButtonWrapper>
        <Button
          disabled={!minStepInputValueAuction || !durationSelectValue}
          onClick={onConfirmAuctionClick}
          role='primary'
          title='Confirm'
        />
      </ButtonWrapper>
    </>
  );

  return (
    <SellModalStyled>
      <Content>
        <Heading size='2'>Selling method</Heading>
      </Content>
      <Tabs
        activeIndex={activeTab}
        labels={['Fixed price', 'Auction']}
        onClick={handleClick}
      />
      <Tabs activeIndex={activeTab}>
        {FixedPriceTab}
        {AuctionTab}
      </Tabs>
    </SellModalStyled>
  );
};

type TSellFixStagesModal = {
  onFinish: () => void;
  collectionId: number,
  tokenId: number,
  sellFix: TFixPriceProps
}

type TSellAuctionStagesModal = {
  onFinish: () => void;
  collectionId: number,
  tokenId: number,
  auction: TAuctionProps
}

export const SellFixStagesModal: FC<TSellFixStagesModal> = ({ collectionId, tokenId, sellFix, onFinish }) => {
  const { stages, status, initiate } = useSellFixStages(collectionId, tokenId);
  useEffect(() => { initiate(sellFix); }, [sellFix]);
  return (
    <div>
      <DefaultMarketStages stages={stages} status={status} onFinish={onFinish} />
    </div>
  );
};

export const SellAuctionStagesModal: FC<TSellAuctionStagesModal> = ({ collectionId, tokenId, auction, onFinish }) => {
  const { stages, status, initiate } = useAuctionSellStages(collectionId, tokenId);

  useEffect(() => { initiate(auction); }, [auction]); //
  return (
    <div>
      <DefaultMarketStages stages={stages} status={status} onFinish={onFinish} />
    </div>
  );
};

const TextStyled = styled(Text)`
  box-sizing: border-box;
  display: flex;
  padding: 8px 16px;
  margin-bottom: 24px;
  border-radius: 4px;
  background-color: ${AdditionalWarning100};
  width: 100%;
`;

const InputWrapper = styled(InputText)`
  margin-bottom: 32px;
`;

const SelectWrapper = styled(Select)`
  margin-bottom: 32px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
  color: ${AdditionalColorDark};
`;

const Content = styled.div`
  && h2 {
    margin-bottom: 0;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SellModalStyled = styled.div`
  width: 100%;

  .unique-input-text {
    width: 100%;
  }

  .unique-select {
    margin-left: 24px;
  }

  .unique-select .select-wrapper > svg {
    z-index: 0;
  }

  .unique-tabs-contents {
    padding-top: 32px;
    padding-bottom: 0;
  }

  .unique-tabs-labels {
    margin-top: 16px;
  }
`;
