import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { Button, Text } from 'components/UI';
import styled from 'styled-components';
import { useApi } from 'hooks/useApi';
import MarketController from 'api/chainApi/MarketController';
import { debounce } from 'utils/helpers';
import { BN } from '@polkadot/util';

import { useGetFee } from '../../../hooks/useGetFee';
import { Price } from '../TokenDetail/Price';
import { Grey300 } from '../../../styles/colors';
import { Offer } from '../../../api/restApi/offers/types';
import { useAccounts } from '../../../hooks/useAccounts';
import BuyBundleInformation from '../TokenDetail/BuyBundleInformation';
import { RoyaltyValue } from '../TokenDetail/Royalty';
import { fromStringToBnString } from 'utils/bigNum';

interface BuyTokenProps {
  offer?: Offer;
  royalty?: number;
  onBuy(): void
  testid?: string
}

export const BuyToken: FC<BuyTokenProps> = ({ offer, royalty, onBuy, testid }) => {
  const { api } = useApi();

  const { fee, fetchingFee, getFee } = useGetFee<Parameters<MarketController['getBuyFixFee']>>(api?.market?.getBuyFixFee.bind(api?.market));
  const { selectedAccount } = useAccounts();

  const rawFee = useMemo(() => {
    return new BN(fromStringToBnString(fee));
  }, [fee]);

  const isNotEnoughBalanceOnPolkadot = useMemo(() => {
    if (selectedAccount?.name !== 'Metamask Account') {
      if (!selectedAccount?.balances?.proper?.raw || selectedAccount.balances?.proper?.raw.isZero() || !offer?.price?.raw) return false;
      if (selectedAccount.balances?.proper?.raw.lte(new BN(offer?.price?.raw))) return false;
      return selectedAccount.balances?.proper?.raw.lte(new BN(offer?.price?.raw).mul(new BN(2)).add(rawFee));
    }
    return false;
  }, [offer?.price?.raw, selectedAccount, rawFee]);

  const isEnoughBalance = useMemo(() => {
    if (!selectedAccount?.balances?.proper?.raw || selectedAccount.balances?.proper?.raw.isZero() || !offer?.price?.raw) return false;
    return selectedAccount.balances?.proper?.raw.gte(new BN(offer?.price?.raw).add(rawFee));
  }, [offer?.price?.raw, selectedAccount?.balances?.proper?.raw, rawFee]);

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
        { account: selectedAccount, contractAddress: offer.contractAddress }
      );
    }, 300)();
  }, [offer, api?.market, selectedAccount?.address]);

  if (!offer) return null;

  return (<>
    <Text size={'l'}>Price</Text>
    <Price price={offer?.price?.parsed.toString()} />
    <RoyaltyValue value={royalty} />
    <ButtonWrapper>
      <Button
        onClick={onBuyClick}
        role='primary'
        title='Buy'
        wide={true}
        disabled={!isEnoughBalance || (royalty || 0) >= 1 || isNotEnoughBalanceOnPolkadot}
      />
    </ButtonWrapper>
    {!isEnoughBalance && !isNotEnoughBalanceOnPolkadot && <Text color={'coral-500'} testid={`${testid}-low-balance-warning`}>Your balance is not enough to pay the price and transaction fees</Text>}
    {isNotEnoughBalanceOnPolkadot && <MessageWrapper>
      <p>Oops, looks like you&apos;re lucky to discover that we have an issue working with Polkadot wallets. Please transfer the required amount to your MetaMask address and purchase the token using MetaMask. We apologize for the inconvenience, and we&apos;ll have this problem fixed very soon!</p>
      <p>For the ones who are curious: we need Polkadot wallet to have 2x amount of NFT price + fee, otherwise the buy transaction will fail. Nonetheless, buying with MetaMask works</p>
    </MessageWrapper>}
    {(royalty || 0) >= 1 && <Text color={'coral-500'} testid={`${testid}-low-balance-warning`}>The royalty is too big. Maximum royalty - 99%</Text>}
    {!!offer?.tokenDescription?.nestingChildTokens?.length && <BuyBundleInformation testid={testid}/>}
    <Divider />
  </>);
};

const ButtonWrapper = styled.div`
  width: 200px;
  margin-top: calc(var(--gap) / 2);
  margin-bottom: calc(var(--gap) / 2);
`;

const Divider = styled.div`
  margin: calc(var(--gap) * 1.5) 0;
  border-top: 1px dashed ${Grey300};
`;

const MessageWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-size: 16px;
  padding: 8px 16px;
  margin: calc(var(--gap) * 1.5) 0;
  border-radius: 4px;
  background-color: var(--color-primary-100);
  color: var(--color-primary-500);
  width: 100%;
  gap: 8px;
`;
