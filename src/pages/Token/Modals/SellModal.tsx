import { Modal, Button, Heading, Tabs, Text, Select, InputText } from '@unique-nft/ui-kit';
import { FC, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import DefaultMarketStages from './StagesModal';
import { TAuctionProps, TFixPriceProps } from './types';
import { MarketType } from '../../../types/MarketTypes';
import { useAuctionSellStages, useSellFixStages } from '../../../hooks/useMarketplaceStages';
import { AdditionalColorDark, AdditionalWarning100 } from '../../../styles/colors';
import { Icon } from '../../../components/Icon/Icon';
import close from '../../../static/icons/close.svg';

type TOnModalClose = () => void;

type TSellModalProps = {
  collectionId: string,
  tokenId: number,
  onModalClose: TOnModalClose
}

// will come from api
const getFees = () => {
  const priceFee = 0.1;
  const stepFee = 0.1;
  return { priceFee, stepFee };
};

export const SellModal: FC<TSellModalProps> = ({ collectionId, tokenId, onModalClose }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [status, setStatus] = useState(MarketType.default); // TODO: naming
  const [auction, setAuction] = useState<TAuctionProps>();
  const [fixPrice, setFixPrice] = useState<TFixPriceProps>();
  const onSell = useCallback((auction: TAuctionProps, fixPrice: TFixPriceProps) => {
    if (auction) {
      setAuction(auction);
      setStatus(MarketType.sellAuction);
    }
    if (fixPrice) {
      setFixPrice(fixPrice);
      setStatus(MarketType.sellFix);
    }
  }, [setStatus, setAuction, setFixPrice]);
  if (status === MarketType.default) return (<Modal isVisible={isOpen} isClosable={true}><SellTypeModal onConfirm={onSell}/></Modal>);
  switch (status) {
    // TODO: move modal iside Sell*StagesModal instead (so we can make it "closable" on errors)
    case MarketType.sellAuction:
      return (<Modal isVisible={isOpen} isClosable={false}><SellAuctionStagesModal collectionId={collectionId} tokenId={tokenId} auction={auction as TAuctionProps} onModalClose={onModalClose} /></Modal>);
    case MarketType.sellFix:
      return (<Modal isVisible={isOpen} isClosable={false}><SellFixStagesModal collectionId={collectionId} tokenId={tokenId} sellFix={fixPrice as TFixPriceProps} onModalClose={onModalClose} /></Modal>);
    default: throw new Error(`Incorrect status provided for processing modal: ${status}`);
  }
};

export const SellTypeModal: FC<any> = ({ onConfirm }) => {
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
    onConfirm({ minimumStep: minStepInputValueAuction, startingPrice: priceInputValue, duration: durationSelectValue } as TAuctionProps);
  }, []);

  const onConfirmFixPriceClick = useCallback(() => {
    onConfirm(null, { price: priceInputValue } as TFixPriceProps); // TODO: proper typing, proper calculated object
  }, []);

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
      id: '3 days',
      title: '3 days'
    },
    {
      id: '7 days',
      title: '7 days'
    },
    {
      id: '14 days',
      title: '14 days'
    },
    {
      id: '21 days',
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
        A fee of ~ 0.000000000000052 OPL can be applied to the transaction
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
        A fee of ~ 0.000000000000052 OPL can be applied to the transaction
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
        <Row>
          <Heading size='2'>Selling method</Heading>
          <IconWrapper>
            <Icon path={close} />
          </IconWrapper>
        </Row>
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
  onModalClose: TOnModalClose,
  collectionId: string,
  tokenId: number,
  sellFix: TFixPriceProps
}

type TSellAuctionStagesModal = {
  onModalClose: TOnModalClose,
  collectionId: string,
  tokenId: number,
  auction: TAuctionProps
}

export const SellFixStagesModal: FC<TSellFixStagesModal> = ({ collectionId, tokenId, sellFix, onModalClose }) => {
  const { stages, status, initiate } = useSellFixStages(collectionId, tokenId.toString());
  useEffect(() => { initiate(sellFix); }, [sellFix]);
  return (
    <div>
      <DefaultMarketStages stages={stages} status={status} onModalClose={onModalClose} />
    </div>
  );
};

export const SellAuctionStagesModal: FC<TSellAuctionStagesModal> = ({ collectionId, tokenId, auction, onModalClose }) => {
  const { stages, status, initiate } = useAuctionSellStages(collectionId, tokenId.toString());
  useEffect(() => { initiate(auction); }, [initiate, auction]);
  return (
    <div>
      <DefaultMarketStages stages={stages} status={status} onModalClose={onModalClose} />
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
  border-radius: 8px;
  border: 1px solid grey;
  padding: 24px;
  box-sizing: border-box;
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
