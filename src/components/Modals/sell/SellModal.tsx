import { Button, Heading, Tabs, Text, Select, InputText } from '@unique-nft/ui-kit';
import { FC, useCallback, useState } from 'react';
import styled from 'styled-components/macro';
import close from '../../../static/icons/close.svg';
import { AdditionalColorDark } from '../../../styles/colors';
import { Icon } from '../../Icon/Icon';

export const SellModal: FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [inputValue, setInputValue] = useState<number>(15);

  const [inputValueAuction, setInputValueAuction] = useState<number>(15);
  const [inputStartingPriceValue, setInputStartingPriceValue] = useState<number>();
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

  const onButtonClick = useCallback(() => {
    console.log('click on confirm');
  }, []);

  const onAuctionInputChange = useCallback(
    (value: number) => {
      setInputValueAuction(value);
    },
    [setInputValueAuction]
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
label='Price'
onChange={onInputChange}
value={inputValue}
      />
      <Text
color='additional-warning-500'
size='s'
      >
        A fee of ~ 0.000000000000052 OPL can be applied to the transaction
      </Text>
      <ButtonWrapper>
        <Button
onClick={onButtonClick}
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
onChange={onAuctionInputChange}
value={inputValueAuction}
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
      <Text
color='additional-warning-500'
size='s'
      >
        A fee of ~ 0.000000000000052 OPL can be applied to the transaction
      </Text>
      <ButtonWrapper>
        <Button
onClick={onButtonClick}
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
