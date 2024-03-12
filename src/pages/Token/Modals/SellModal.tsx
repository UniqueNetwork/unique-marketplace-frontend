import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { Heading, Link } from '@unique-nft/ui-kit';
import { useNotifications, Button } from 'components/UI';
import { NumberInput } from 'components/NumberInput/NumberInput';
import styled from 'styled-components';

import { useApi } from 'hooks/useApi';

import DefaultMarketStages from './StagesModal';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { TAuctionProps, TFixPriceProps } from './types';
import { useAuctionSellStages, useSellFixStages } from '../../../hooks/marketplaceStages';
import { useAccounts } from '../../../hooks/useAccounts';
import { StageStatus } from '../../../types/StagesTypes';
import MarketController from 'api/chainApi/MarketController';
import { useGetFee } from 'hooks/useGetFee';
import { debounce } from 'utils/helpers';
import { FeeMessage } from 'components';
import { BN } from '@polkadot/util';
import { fromStringToBnString } from 'utils/bigNum';
import { WarningBlock } from 'components/WarningBlock/WarningBlock';
import { fixPriceSellingCollectionIds } from '../constants';

export const SellModal: FC<TTokenPageModalBodyProps> = ({ token, collection, onFinish, setIsClosable, testid }) => {
  const { collectionId, tokenId } = token || {};
  const [status, setStatus] = useState<'ask' | 'auction-stage' | 'fix-price-stage'>('ask'); // TODO: naming
  const [fixPrice, setFixPrice] = useState<TFixPriceProps>();

  const onSellFixPrice = useCallback((fixPrice: TFixPriceProps) => {
    setFixPrice(fixPrice);
    setStatus('fix-price-stage');
    setIsClosable(false);
  }, [setStatus, setFixPrice, setIsClosable]);

  if (!token) return null;

  if (status === 'ask') {
    return (<AskSellModal
      collectionId={token.collectionId}
      tokenId={token.tokenId}
      onSellFixPrice={onSellFixPrice}
      testid={`${testid}-sell-ask`}
    />);
  }
  switch (status) {
    case 'fix-price-stage':
      return (<SellFixStagesModal
        collectionId={collectionId || 0}
        tokenId={tokenId || 0}
        tokenPrefix={collection?.tokenPrefix || ''}
        sellFix={fixPrice as TFixPriceProps}
        onFinish={onFinish}
        testid={`${testid}-sell-fix`}
      />);
    default: throw new Error(`Incorrect status provided for processing modal: ${status as string}`);
  }
};

type TOnSellFix = (price: TFixPriceProps) => void;
type TAskSellModalProps = {
  collectionId: number,
  tokenId: number,
  onSellFixPrice: TOnSellFix,
  testid: string
}

export const AskSellModal: FC<TAskSellModalProps> = ({ collectionId, tokenId, onSellFixPrice, testid }) => {
  const { chainProperties, api, currentChainId } = useApi();
  const { selectedAccount } = useAccounts();
  const [priceInputValue, setPriceInputValue] = useState<string>();

  // use FHF mock
  const isFixedPrice = useMemo(() => {
    const price = fixPriceSellingCollectionIds[currentChainId || '']?.find((item) => item.collectionId === collectionId)?.price;
    setPriceInputValue(price?.toString());
    return !!price;
  }, [collectionId, currentChainId]);

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

    onSellFixPrice({ price: priceInputValue, accountAddress: selectedAccount.address } as TFixPriceProps); // TODO: proper typing, proper calculated object
  }, [priceInputValue, selectedAccount, onSellFixPrice]);

  const tokenSymbol = useMemo(() => chainProperties?.token || '', [chainProperties]);

  const { fee, fetchingFee, getFee } = useGetFee<Parameters<MarketController['getSellFixFee']>>(api?.market?.getSellFixFee.bind(api?.market));

  const isEnoughBalance = useMemo(() => {
    if (isSponsored) return true;
    if (!selectedAccount?.balances?.proper.raw || selectedAccount.balances?.proper.raw.isZero() || !fee) return false;

    return selectedAccount.balances?.proper.raw.gte(new BN(fromStringToBnString(fee)));
  }, [fee, selectedAccount?.balances?.proper.raw, isSponsored]);

  useEffect(() => {
    if (!api || !selectedAccount || !priceInputValue) return;
    debounce(async () => {
      await getFee(
        collectionId,
        tokenId,
        Number(priceInputValue),
        1,
        { account: selectedAccount }
      );
    }, 300)();
  }, [collectionId, tokenId, priceInputValue, api?.market, selectedAccount?.address]);

  const FixedPriceTab = (
    <>
      <InputWrapper
        label={`Price (${tokenSymbol})*`}
        onChange={onPriceInputChange}
        disabled={isFixedPrice}
        value={priceInputValue?.toString()}
        testid={`${testid}-price-input`}
      />
      {!isSponsored && <FeeMessage
        isFeeLoading={fetchingFee}
        fee={fee || '0'}
        testid={`${testid}-fee-message`}
      />}
      {isSponsored && <WarningBlock>
        Collection ID {collectionId} sponsored
      </WarningBlock>}
      <ButtonWrapper>
        <Button
          disabled={!isSponsored && (fetchingFee || !priceInputValue || !Number(priceInputValue))}
          onClick={onConfirmFixPriceClick}
          role='primary'
          title='Confirm'
          testid={`${testid}-confirm-button`}
        />
      </ButtonWrapper>
    </>
  );

  return (
    <SellModalStyled data-testid={testid}>
      <Content>
        <Heading size='2' testid={`${testid}-heading`}>Selling token</Heading>
      </Content>
      {FixedPriceTab}
    </SellModalStyled>
  );
};

type TSellFixStagesModal = {
  onFinish: () => void
  collectionId: number
  tokenId: number
  tokenPrefix: string
  sellFix: TFixPriceProps
  testid: string
}

type TSellAuctionStagesModal = {
  onFinish: () => void
  collectionId: number
  tokenId: number
  tokenPrefix: string
  auction: TAuctionProps
  testid: string
}

export const SellFixStagesModal: FC<TSellFixStagesModal> = ({ collectionId, tokenId, tokenPrefix, sellFix, onFinish, testid }) => {
  const { stages, status, initiate } = useSellFixStages(collectionId, tokenId);
  const { info } = useNotifications();

  useEffect(() => { initiate(sellFix); }, [sellFix]);

  useEffect(() => {
    if (status === StageStatus.success) {
      info(
        <div data-testid={`${testid}-success-notification`}><Link href={`/token/${collectionId}/${tokenId}`} title={`${tokenPrefix} #${tokenId}`}/> offered for sale</div>,
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

export const SellAuctionStagesModal: FC<TSellAuctionStagesModal> = ({ collectionId, tokenId, tokenPrefix, auction, onFinish, testid }) => {
  const { stages, status, initiate } = useAuctionSellStages(collectionId, tokenId);
  const { info } = useNotifications();

  useEffect(() => { initiate(auction); }, [auction]); //

  useEffect(() => {
    if (status === StageStatus.success) {
      info(<div data-testid={`${testid}-success-notification`}><Link href={`/token/${collectionId}/${tokenId}`} title={`${tokenPrefix} #${tokenId}`}/> is up for auction</div>, { name: 'success', size: 32, color: 'var(--color-additional-light)' });
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
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;

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

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  @media (max-width: 568px) {
    flex-direction: column;
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
