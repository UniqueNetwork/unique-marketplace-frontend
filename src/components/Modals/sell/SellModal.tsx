import { Button, Heading, Tabs, Text, Select, InputText } from '@unique-nft/ui-kit';
import { FC, useCallback, useState } from 'react';
import styled from 'styled-components/macro';
import close from '../../../static/icons/close.svg';
import { AdditionalColorDark } from '../../../styles/colors';
import { Icon } from '../../Icon/Icon';

export const SellModal: FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [inputValue, setInputValue] = useState<number>(15);
  const [selectValue, setSelectValue] = useState<string>('QTZ');

  const [inputValueAuction, setInputValueAuction] = useState<number>(15);
  const [selectValueAuction, setSelectValueAuction] = useState<string>('QTZ');
  const [inputStartingPriceValue, setInputStartingPriceValue] =
    useState<number>();
  const [durationSelectValue, setDurationSelectValue] = useState<string>();

  const handleClick = useCallback(
    (tabIndex: number) => {
      setActiveTab(tabIndex);
    },
    [setActiveTab]
  );

  const onInputChange = useCallback(
    (value: number) => {
      setInputValue(value);
    },
    [setInputValue]
  );

  const onSelectChange = useCallback(
    (value: string) => {
      setSelectValue(value);
    },
    [setSelectValue]
  );

  const onButtonClick = useCallback(() => {
    console.log('click on confirm');
  }, []);

  const onAuctionInputChange = useCallback(
    (value: number) => {
      setInputValueAuction(value);
    },
    [setInputValueAuction]
  );

  const onAuctionSelectChange = useCallback(
    (value: string) => {
      setSelectValueAuction(value);
    },
    [setSelectValueAuction]
  );

  const onInputStartingPriceChange = useCallback(
    (value: number) => {
      setInputStartingPriceValue(value);
    },
    [setInputStartingPriceValue]
  );

  const onDurationSelectChange = useCallback(
    (value: string) => {
      setDurationSelectValue(value);
    },
    [setDurationSelectValue]
  );

  const sortingOptions = [
    {
      id: 'QTZ',
      title: 'QTZ'
    },
    {
      id: 'KSM',
      title: 'KSM'
    },
    {
      id: 'UNQ',
      title: 'UNQ'
    }
  ];

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
      <Text
size={'m'}
weight={'medium'}
      >
        Price
      </Text>
      <Row>
        <Select
          onChange={onSelectChange}
          options={sortingOptions}
          value={selectValue}
        />
        <InputText
onChange={onInputChange}
value={inputValue}
        />
      </Row>
      <Text size={'s'}>
        A fee of ~ 0.000000000000052 OPL can be applied to the transaction
      </Text>
      <ButtonWrapper>
        <Button
onClick={onButtonClick}
role='primary'
title={'Confirm'}
        />
      </ButtonWrapper>
    </>
  );

  const AuctionTab = (
    <>
      <Text
size={'m'}
weight={'medium'}
      >
        Minimum step*
      </Text>
      <Row>
        <Select
          onChange={onAuctionSelectChange}
          options={sortingOptions}
          value={selectValueAuction}
        />
        <InputText
onChange={onAuctionInputChange}
value={inputValueAuction}
        />
      </Row>
      <Row>
        <Text
size={'m'}
weight={'medium'}
        >
          Starting Price
        </Text>
        <Text
size={'m'}
weight={'medium'}
        >
          Duration*
        </Text>
      </Row>

      <Row>
        <InputText
          onChange={onInputStartingPriceChange}
          value={inputStartingPriceValue}
        />

        <Select
          onChange={onDurationSelectChange}
          options={durationOptions}
          value={durationSelectValue}
        />
      </Row>
      <Text size={'s'}>
        A fee of ~ 0.000000000000052 OPL can be applied to the transaction
      </Text>
      <ButtonWrapper>
        <Button
onClick={onButtonClick}
role='primary'
title={'Confirm'}
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
      <Tabs
activeIndex={activeTab}
contents={[FixedPriceTab, AuctionTab]}
      />
    </SellModalStyled>
  );
};

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
    margin-bottom: 0px;
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
`;
