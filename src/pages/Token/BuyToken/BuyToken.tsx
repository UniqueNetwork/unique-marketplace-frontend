import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { Button, Text } from 'components/UI';
import styled from 'styled-components';

import { useGetFee } from '../../../hooks/useGetFee';
import { Price } from '../TokenDetail/Price';
import { Grey300 } from '../../../styles/colors';
import { Offer } from '../../../api/restApi/offers/types';
import { useAccounts } from '../../../hooks/useAccounts';
import BuyBundleInformation from '../TokenDetail/BuyBundleInformation';
import { FeeMessage } from 'components';
import { useApi } from 'hooks/useApi';
import MarketController from 'api/chainApi/MarketController';
import { debounce } from 'utils/helpers';

interface BuyTokenProps {
  offer?: Offer;
  onBuy(): void
  testid?: string
}

export const BuyToken: FC<BuyTokenProps> = ({ offer, onBuy, testid }) => {
  const { api } = useApi();

  const { fee, fetchingFee, getFee } = useGetFee<Parameters<MarketController['getBuyFixFee']>>(api?.market?.getBuyFixFee);
  const { selectedAccount } = useAccounts();

  const isEnoughBalance = useMemo(() => {
    if (!selectedAccount?.balance?.raw || selectedAccount.balance?.raw.isZero() || !offer?.price?.raw) return false;
    // TODO: check contractCall fee
  }, [offer?.price?.raw, selectedAccount?.balance?.raw]);

  const onBuyClick = useCallback(() => {
    if (!isEnoughBalance) return;

    onBuy();
  }, [onBuy, isEnoughBalance]);

  useEffect(() => {
    if (!offer || !api || !selectedAccount) return;
    debounce(async () => {
      await getFee(
        offer.collectionId,
        offer.tokenId,
        1,
        { account: selectedAccount }
      );
    }, 300);
  }, [offer, api, selectedAccount?.address, getFee]);

  if (!offer) return null;

  return (<>
    <Text size={'l'}>Price</Text>
    <Price price={offer?.price?.parsed.toString()} />
    <ButtonWrapper>
      <Button
        onClick={onBuyClick}
        role='primary'
        title='Buy'
        wide={true}
        disabled={!isEnoughBalance}
      />
    </ButtonWrapper>
    <FeeMessage
      isFeeLoading={fetchingFee}
      fee={fee || '0'}
      testid={`${testid}-fee-message`}
    />
    {!isEnoughBalance && <Text color={'coral-500'} testid={`${testid}-low-balance-warning`}>Your balance is too low to buy</Text>}
    {!!offer?.tokenDescription?.nestingChildTokens?.length && <BuyBundleInformation testid={testid}/>}
    <Divider />
  </>);
};

const ButtonWrapper = styled.div`
  width: 200px;
  margin-top: calc(var(--gap) * 1.5);
`;

const Divider = styled.div`
  margin: calc(var(--gap) * 1.5) 0;
  border-top: 1px dashed ${Grey300};
`;
