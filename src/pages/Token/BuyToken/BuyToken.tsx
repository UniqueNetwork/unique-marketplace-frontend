import React, { FC, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { Button, Text, Tooltip } from 'components/UI';
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
import { ConnectWalletModalContext } from 'account/ConnectWalletModalContext';

interface BuyTokenProps {
  offer?: Offer;
  royalty?: number;
  onBuy(): void
  testid?: string
}

export const BuyToken: FC<BuyTokenProps> = ({ offer, royalty, onBuy, testid }) => {
  const { api, chainProperties } = useApi();

  const { fee, getFee } = useGetFee<Parameters<MarketController['getBuyFixFee']>>(api?.market?.getBuyFixFee.bind(api?.market));
  const { selectedAccount } = useAccounts();
  const { setIsOpenConnectWalletModal } = useContext(ConnectWalletModalContext);

  const rawFee = useMemo(() => {
    return new BN(fromStringToBnString(fee));
  }, [fee]);

  const isNotEnoughBalanceOnPolkadot = useMemo(() => {
    if (selectedAccount?.name !== 'Metamask Account') {
      if (!selectedAccount?.balances?.proper?.raw || selectedAccount.balances?.proper?.raw.isZero() || !offer?.price?.raw) return false;
      if (selectedAccount.balances?.proper?.raw.lte(new BN(offer?.price?.raw))) return false;
      return selectedAccount.balances?.proper?.raw.lte(new BN(offer?.price?.raw).add(rawFee));
    }
    return false;
  }, [offer?.price?.raw, offer?.price?.currency, selectedAccount, rawFee]);

  const isEnoughBalance = useMemo(() => {
    const extra = new BN(10).pow(new BN(chainProperties?.decimals || 18));
    if (!selectedAccount?.balances?.proper?.raw || selectedAccount.balances?.proper?.raw.isZero() || !offer?.price?.raw) return false;
    return selectedAccount.balances?.proper?.raw.gte(new BN(offer?.price?.raw).add(rawFee).add(extra));
  }, [offer?.price?.raw, offer?.price?.currency, selectedAccount?.balances?.proper?.raw, rawFee, chainProperties]);

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

  const onShowConnectAccountDialog = useCallback(() => {
    setIsOpenConnectWalletModal(true);
  }, []);

  const buyButtonRef = useRef<HTMLButtonElement>(null);

  if (!offer) return null;

  return (<>
    <Text size={'l'}>Price</Text>
    <Price price={offer?.price} />
    <RoyaltyValue value={royalty} />
    <ButtonWrapper>
      <Button
        onClick={selectedAccount ? onBuyClick : onShowConnectAccountDialog}
        role='primary'
        title='Buy'
        ref={buyButtonRef}
        wide={true}
        // disabled={(!!selectedAccount && !isEnoughBalance) || (royalty || 0) >= 1 || isNotEnoughBalanceOnPolkadot}
      />
    </ButtonWrapper>
    {!!selectedAccount && !isEnoughBalance && <Tooltip targetRef={buyButtonRef} >
      Not enough funds in your wallet
    </Tooltip>}
    {(royalty || 0) >= 1 && <Text color={'coral-500'} testid={`${testid}-low-balance-warning`}>The royalty is too big. Maximum royalty - 99%</Text>}
    <Divider />
  </>);
};

const ButtonWrapper = styled.div`
  width: 200px;
  margin-top: calc(var(--prop-gap) / 2);
  margin-bottom: calc(var(--prop-gap) / 2);
`;

const Divider = styled.div`
  margin: calc(var(--prop-gap) * 1.5) 0;
  border-top: 1px dashed ${Grey300};
`;

const MessageWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-size: 16px;
  padding: 8px 16px;
  margin: calc(var(--prop-gap) * 1.5) 0;
  border-radius: 4px;
  background-color: var(--color-primary-100);
  color: var(--color-primary-500);
  width: 100%;
  gap: 8px;
`;
