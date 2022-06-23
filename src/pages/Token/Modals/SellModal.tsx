import { Button, Heading, Tabs, Text, Select, Link } from '@unique-nft/ui-kit';
import { SelectOptionProps } from '@unique-nft/ui-kit/dist/cjs/types';
import React, { FC, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import DefaultMarketStages from './StagesModal';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { TAuctionProps, TFixPriceProps } from './types';
import { useAuctionSellStages, useSellFixStages } from '../../../hooks/marketplaceStages';
import { useNotification } from '../../../hooks/useNotification';
import { useFee } from '../../../hooks/useFee';
import { useAccounts } from '../../../hooks/useAccounts';
import { NumberInput } from '../../../components/NumberInput/NumberInput';
import { AdditionalWarning100 } from '../../../styles/colors';
import { StageStatus } from '../../../types/StagesTypes';
import { NotificationSeverity } from '../../../notification/NotificationContext';

const tokenSymbol = 'KSM';

export const SellModal: FC<TTokenPageModalBodyProps> = ({ token, onFinish, setIsClosable }) => {
  const { collectionId, id: tokenId } = token || {};
  const [status, setStatus] = useState<'ask' | 'auction-stage' | 'fix-price-stage'>('ask'); // TODO: naming
  const [auction, setAuction] = useState<TAuctionProps>();
  const [fixPrice, setFixPrice] = useState<TFixPriceProps>();

  const onSellAuction = useCallback((auction: TAuctionProps) => {
      setAuction(auction);
      setStatus('auction-stage');
      setIsClosable(false);
  }, [setStatus, setAuction, setIsClosable]);

  const onSellFixPrice = useCallback((fixPrice: TFixPriceProps) => {
    setFixPrice(fixPrice);
    setStatus('fix-price-stage');
    setIsClosable(false);
  }, [setStatus, setFixPrice, setIsClosable]);

  if (!token) return null;

  if (status === 'ask') return (<AskSellModal onSellAuction={onSellAuction} onSellFixPrice={onSellFixPrice} />);
  switch (status) {
    case 'auction-stage':
      return (<SellAuctionStagesModal
        collectionId={collectionId || 0}
        tokenId={tokenId || 0}
        tokenPrefix={token?.prefix || ''}
        auction={auction as TAuctionProps}
        onFinish={onFinish}
      />);
    case 'fix-price-stage':
      return (<SellFixStagesModal
        collectionId={collectionId || 0}
        tokenId={tokenId || 0}
        tokenPrefix={token?.prefix || ''}
        sellFix={fixPrice as TFixPriceProps}
        onFinish={onFinish}
      />);
    default: throw new Error(`Incorrect status provided for processing modal: ${status as string}`);
  }
};

type TOnSellAuction = (auction: TAuctionProps) => void;
type TOnSellFix = (price: TFixPriceProps) => void;
type TAskSellModalProps = {
  onSellAuction: TOnSellAuction,
  onSellFixPrice: TOnSellFix,
}

export const AskSellModal: FC<TAskSellModalProps> = ({ onSellAuction, onSellFixPrice }) => {
  const { selectedAccount } = useAccounts();
  const { kusamaFee } = useFee();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [priceInputValue, setPriceInputValue] = useState<string>();

  const [minStepInputValueAuction, setMinStepInputValueAuction] = useState<string>();
  const [inputStartingPriceValue, setInputStartingPriceValue] = useState<string>();
  const [durationSelectValue, setDurationSelectValue] = useState<number>();

  const handleClick = useCallback(
    (tabIndex: number) => {
      setActiveTab(tabIndex);
    },
    [setActiveTab]
  );

  const onPriceInputChange = useCallback((value: string) => {
      setPriceInputValue(value);
    },
    [setPriceInputValue]
  );

  const isAuctionValid = selectedAccount && minStepInputValueAuction && durationSelectValue && inputStartingPriceValue && Number(minStepInputValueAuction) && Number(inputStartingPriceValue);

  const onConfirmAuctionClick = useCallback(() => {
    if (!isAuctionValid) return;

    onSellAuction({ minimumStep: minStepInputValueAuction, startingPrice: inputStartingPriceValue || minStepInputValueAuction, duration: durationSelectValue, accountAddress: selectedAccount.address } as TAuctionProps);
  }, [minStepInputValueAuction, inputStartingPriceValue, durationSelectValue, selectedAccount, onSellAuction]);

  const onConfirmFixPriceClick = useCallback(() => {
    if (!selectedAccount || !priceInputValue || !Number(priceInputValue)) return;

    onSellFixPrice({ price: priceInputValue, accountAddress: selectedAccount.address } as TFixPriceProps); // TODO: proper typing, proper calculated object
  }, [priceInputValue, selectedAccount, onSellFixPrice]);

  const onMinStepInputChange = useCallback(
    (value: string) => {
      setMinStepInputValueAuction(value);
    },
    [setMinStepInputValueAuction]
  );

  const onInputStartingPriceChange = useCallback(
    (value: string) => {
      setInputStartingPriceValue(value);
    },
    [setInputStartingPriceValue]
  );

  const onDurationSelectChange = useCallback((value: SelectOptionProps) => {
      setDurationSelectValue(Number(value.id));
    }, [setDurationSelectValue]
  );

  const durationOptions: SelectOptionProps[] = [
    {
      id: '3',
      title: '3 days'
    },
    {
      id: '7',
      title: '7 days'
    },
    {
      id: '14',
      title: '14 days'
    },
    {
      id: '21',
      title: '21 days'
    }
  ];

  const FixedPriceTab = (
    <>
      <InputWrapper
        label={`Price (${tokenSymbol})*`}
        onChange={onPriceInputChange}
        value={priceInputValue?.toString()}
      />
      <TextStyled
        color='additional-warning-500'
        size='s'
      >
        {`A fee of ~ ${kusamaFee} ${tokenSymbol} can be applied to the transaction`}
      </TextStyled>
      <ButtonWrapper>
        <Button
          disabled={!priceInputValue || !Number(priceInputValue)}
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
        label={`Minimum step (${tokenSymbol})*`}
        onChange={onMinStepInputChange}
        value={minStepInputValueAuction?.toString()}
      />
      <Row>
        <InputWrapper
          label={`Starting Price (${tokenSymbol})`}
          onChange={onInputStartingPriceChange}
          value={inputStartingPriceValue?.toString()}
        />
        <SelectWrapper
          label='Duration*'
          onChange={onDurationSelectChange}
          options={durationOptions}
          optionKey={'id'}
          value={durationSelectValue?.toString()}
        />
      </Row>
      <TextStyled
        color='additional-warning-500'
        size='s'
      >
        {`A fee of ~ ${kusamaFee} ${tokenSymbol} can be applied to the transaction`}
      </TextStyled>
      <ButtonWrapper>
        <Button
          disabled={!isAuctionValid}
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
  onFinish: () => void
  collectionId: number
  tokenId: number
  tokenPrefix: string
  sellFix: TFixPriceProps
}

type TSellAuctionStagesModal = {
  onFinish: () => void
  collectionId: number
  tokenId: number
  tokenPrefix: string
  auction: TAuctionProps
}

export const SellFixStagesModal: FC<TSellFixStagesModal> = ({ collectionId, tokenId, tokenPrefix, sellFix, onFinish }) => {
  const { stages, status, initiate } = useSellFixStages(collectionId, tokenId);
  const { push } = useNotification();

  useEffect(() => { initiate(sellFix); }, [sellFix]);

  useEffect(() => {
    if (status === StageStatus.success) {
      push({ severity: NotificationSeverity.success, message: <><Link href={`/token/${collectionId}/${tokenId}`} title={`${tokenPrefix} #${tokenId}`}/> offered for sale</> });
    }
  }, [status]);

  return (
    <div>
      <DefaultMarketStages stages={stages} status={status} onFinish={onFinish} />
    </div>
  );
};

export const SellAuctionStagesModal: FC<TSellAuctionStagesModal> = ({ collectionId, tokenId, tokenPrefix, auction, onFinish }) => {
  const { stages, status, initiate } = useAuctionSellStages(collectionId, tokenId);
  const { push } = useNotification();

  useEffect(() => { initiate(auction); }, [auction]); //

  useEffect(() => {
    if (status === StageStatus.success) {
      push({ severity: NotificationSeverity.success, message: <><Link href={`/token/${collectionId}/${tokenId}`} title={`${tokenPrefix} #${tokenId}`}/> is up for auction</> });
    }
  }, [status]);

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

const InputWrapper = styled(NumberInput)`
  margin-bottom: 32px;
  width: 100%;
`;

const SelectWrapper = styled(Select)`
  margin-bottom: 32px;
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

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SellModalStyled = styled.div`
  width: 100%;

  .unique-input-text, div[class^=NumberInput] {
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
