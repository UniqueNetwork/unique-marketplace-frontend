import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useNotifications, Button, Text, Heading, Loader, Select } from 'components/UI';
import { NumberInput } from 'components/NumberInput/NumberInput';
import styled from 'styled-components';

import { useApi } from 'hooks/useApi';

import DefaultMarketStages from './StagesModal';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { TFixPriceProps } from './types';
import { useChangePriceStages } from '../../../hooks/marketplaceStages';
import { useAccounts } from '../../../hooks/useAccounts';
import { StageStatus } from '../../../types/StagesTypes';
import { WarningBlock } from 'components/WarningBlock/WarningBlock';
import { Offer } from 'api/restApi/offers/types';
import { useCoinGeckoApi } from 'api/coinGeckoApi/useCoinGeckoApi';
import { fixPriceSellingCollectionIds } from '../constants';
import { SelectOptionProps } from 'components/UI/types';
import ComingSoon from '../TokenDetail/CurrencesComingSoon';

export const ChangePriceModal: FC<TTokenPageModalBodyProps> = ({ token, offer, collection, onFinish, setIsClosable, testid }) => {
  const { collectionId, tokenId } = token || {};
  const [status, setStatus] = useState<'ask' | 'stage'>('ask'); // TODO: naming
  const [fixPrice, setFixPrice] = useState<TFixPriceProps>();

  const onChangePrice = useCallback((fixPrice: TFixPriceProps) => {
    setFixPrice(fixPrice);
    setStatus('stage');
    setIsClosable(false);
  }, [setStatus, setFixPrice, setIsClosable]);

  if (!token) return null;

  if (status === 'ask') {
    return (<AskPriceModal
      collectionId={token.collectionId}
      tokenId={token.tokenId}
      onChangePrice={onChangePrice}
      testid={`${testid}-sell-ask`}
      oldPrice={offer?.price.parsed || 0}
      oldCurrency={offer?.price.currency || 0}
    />);
  }
  return (<ChangePriceStagesModal
    collectionId={collectionId || 0}
    tokenId={tokenId || 0}
    tokenPrefix={collection?.tokenPrefix || ''}
    sellFix={fixPrice as TFixPriceProps}
    offer={offer}
    onFinish={onFinish}
    testid={`${testid}-change-price`}
  />);
};

type TChangePriceModalProps = {
  collectionId: number,
  tokenId: number,
  onChangePrice: (price: TFixPriceProps) => void,
  testid: string,
  oldPrice: number,
  oldCurrency: number
}

export const AskPriceModal: FC<TChangePriceModalProps> = ({ collectionId, tokenId, onChangePrice, testid, oldPrice, oldCurrency }) => {
  const { api, currentChainId, currencies, currencyMap } = useApi();
  const { selectedAccount } = useAccounts();
  const [priceInputValue, setPriceInputValue] = useState<string>();
  const [selectedCurrencyOption, setSelectedCurrencyOption] = useState(currencyMap.get(String(oldCurrency) ) || currencyMap.get('0'));

  // use FHF min price
  const [minPrice, setMinPrice] = useState<number>(0);
  const { fetchCryptoCurrency, isFetching } = useCoinGeckoApi();
  const [currency, setCurrency] = useState<string>();
  useEffect(() => {
    void (async () => {
      const price = fixPriceSellingCollectionIds[currentChainId || '']?.find((item) => item.collectionId === collectionId)?.price;
      if (!price) return;
      const currency = await fetchCryptoCurrency();
      setCurrency(currency.toFixed(6));
      const minPrice = Math.floor(price / currency * 1000) / 1000;
      setMinPrice(minPrice);
      setPriceInputValue((minPrice).toFixed(4));
    })();
  }, []);

  const [isSponsored, setIsSponsored] = useState(false);

  useEffect(() => {
    void (async () => {
      const collection = await api?.collection?.getCollection(collectionId);
      setIsSponsored(!!collection?.sponsorship?.isConfirmed);
    })();
  }, [collectionId]);

  const onPriceInputChange = useCallback((value: string) => {
      setPriceInputValue(value);
    },
    [setPriceInputValue]
  );

  const onConfirmFixPriceClick = useCallback(() => {
    if (!selectedAccount || !priceInputValue || !Number(priceInputValue)) return;

    onChangePrice({ price: priceInputValue, accountAddress: selectedAccount.address, currency: Number(selectedCurrencyOption?.collectionId) } as TFixPriceProps); // TODO: proper typing, proper calculated object
  }, [priceInputValue, selectedAccount, selectedCurrencyOption, onChangePrice]);

  const isPriceAvailable = useMemo(() => {
    return Number(priceInputValue) >= minPrice;
  }, [priceInputValue, minPrice]);

  const onSelectChange = useCallback((value: SelectOptionProps) => {
    const currencySelected = currencyMap.get(value.id as string);
    setSelectedCurrencyOption(currencySelected);
  }, [currencyMap]);

  if (isFetching) return <Loader />;

  return (
    <SellModalStyled data-testid={testid}>
      <Content>
        <Heading size='2' testid={`${testid}-heading`}>
          Changing price
        </Heading>
      </Content>
      <SelectWrapper
        onChange={onSelectChange}
        options={currencies.map((option) => ({
          id: option.id,
          title: option.title,
          iconLeft: { size: 20, file: option.iconUrl }
        }))}
        value={selectedCurrencyOption?.id || ''}
        testid={`${testid}-sorting-select`}
        label={'Select currency'}
      >
        {currencies.length <= 1 && (
          <ComingSoon />
        )}
      </SelectWrapper>
      <InputWrapper
        label={`Price*`}
        onChange={onPriceInputChange}
        value={priceInputValue?.toString()}
        testid={`${testid}-price-input`}
      />
      {minPrice > 0 && <WarningBlock>
        <Text color='grey-500' size='s'>Min price: {minPrice.toFixed(4)} UNQ equivalent $10 (current rate: 1 UNQ = ${currency})</Text>
      </WarningBlock>}
      {isSponsored && <WarningBlock>
        Collection ID {collectionId} sponsored
      </WarningBlock>}
      <ButtonWrapper>
        <Button
          disabled={(!isSponsored && (!priceInputValue || !Number(priceInputValue))) || !isPriceAvailable}
          onClick={onConfirmFixPriceClick}
          role='primary'
          title='Confirm'
          testid={`${testid}-confirm-button`}
        />
      </ButtonWrapper>
    </SellModalStyled>
  );
};

type TChangePriceStagesModal = {
  onFinish: () => void
  collectionId: number
  tokenId: number
  tokenPrefix: string
  offer?: Offer
  sellFix: TFixPriceProps
  testid: string
}

export const ChangePriceStagesModal: FC<TChangePriceStagesModal> = ({ collectionId, offer, tokenId, tokenPrefix, sellFix, onFinish, testid }) => {
  const { contractAddress } = offer || {};
  const { stages, status, initiate } = useChangePriceStages(collectionId, tokenId, contractAddress);
  const { info } = useNotifications();

  useEffect(() => { initiate(sellFix); }, [sellFix]);

  useEffect(() => {
    if (status === StageStatus.success) {
      info(
        <div data-testid={`${testid}-success-notification`}>
          The price of{' '}
          <NavLink to={`/token/${collectionId}/${tokenId}`}>
            {tokenPrefix} #{tokenId}
          </NavLink>{' '}
          changed
        </div>,
        { name: 'success', size: 32, color: 'var(--color-additional-light)' }
      );
    }
  }, [status]);

  return (
    <div>
      <DefaultMarketStages
        stages={stages}
        status={status}
        onFinish={onFinish}
        testid={`${testid}`}
      />
    </div>
  );
};

const InputWrapper = styled(NumberInput)`
  width: 100%;
  margin-top: 8px;
`;

const SelectWrapper = styled(Select)`
  width: 100%;
  margin: 8px 0 0 0 !important;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 32px;

  @media (max-width: 568px) {
    button {
      width: 100%;
    }
  }
`;

const Content = styled.div`
  && h2 {
  }
`;

const SellModalStyled = styled.div`
  width: 100%;

  .unique-input-text, div[class^=NumberInput] {
    width: 100%;
  }

  .unique-select {
    margin-left: 24px;

    @media (max-width: 568px) {
      margin-left: 0;
    }
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
