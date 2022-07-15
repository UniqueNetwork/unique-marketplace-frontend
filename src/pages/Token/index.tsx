import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon, Link, useNotifications } from '@unique-nft/ui-kit';

import { useApi } from '../../hooks/useApi';
import { NFTToken } from '../../api/chainApi/unique/types';
import { MarketType } from '../../types/MarketTypes';
import { CommonTokenDetail } from './TokenDetail/CommonTokenDetail';
import { useOffer } from '../../api/restApi/offers/offer';
import { TokenTrading } from './TokenDetail/TokenTrading';
import { Error404 } from '../errors/404';
import TokenPageModal from './Modals/TokenPageModal';
import { PagePaper } from '../../components/PagePaper/PagePaper';
import { useAccounts } from '../../hooks/useAccounts';
import { shortcutText } from '../../utils/textUtils';
import { compareEncodedAddresses } from '../../api/chainApi/utils/addressUtils';
import styled from 'styled-components';
import { BlueGrey500 } from 'styles/colors';

const testid = 'token-page';

const TokenPage = () => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const { id, collectionId } = useParams<{ id: string, collectionId: string}>();
  const [token, setToken] = useState<NFTToken>();
  const [isFetchingToken, setIsFetchingToken] = useState<boolean>(true);
  const { offer, fetch: fetchOffer, isFetching: isFetchingOffer } = useOffer(Number(collectionId), Number(id));
  const [marketType, setMarketType] = useState<MarketType>(MarketType.default);
  const navigate = useNavigate();

  const { info } = useNotifications();

  const fetchToken = useCallback(async () => {
    if (!api?.nft) return;
    setIsFetchingToken(true);
    const token = await api?.nft?.getToken(Number(collectionId), Number(id)) as NFTToken;
    setToken(token);
    setIsFetchingToken(false);
  }, [api?.nft, collectionId, id]);

  useEffect(() => {
    if (isFetchingOffer) return;
    if (offer || token) {
      setIsFetchingToken(false);
      return;
    }
    void fetchToken();
  }, [fetchToken, isFetchingOffer, offer, token]);

  const onClose = useCallback(() => {
    setMarketType(MarketType.default);
  }, []);

  const onFinish = useCallback(() => {
    setMarketType(MarketType.default);
    void fetchToken();
    fetchOffer(Number(collectionId), Number(id));
  }, [fetchOffer, fetchToken, collectionId, id]);

  const onActionClick = useCallback((action: MarketType) => () => {
    setMarketType(action);
  }, []);

  const onAuctionClose = useCallback((newOwnerAddress: string) => {
    if (!token) return;
    info(
      <div data-testid={`${testid}-success-notification`}>
        {compareEncodedAddresses(
          newOwnerAddress,
          selectedAccount?.address || ''
        )
          ? 'You are'
          : `${shortcutText(newOwnerAddress)} is` }  the new owner of <Link href={`/token/${token.collectionId}/${token.id}`} title={`${token.prefix} #${token.id}`}/>
      </div>,
      { name: 'success', size: 32, color: 'var(--color-additional-light)' }
    );

    fetchOffer(Number(collectionId), Number(id));
    fetchToken();
  }, [info, fetchOffer, fetchToken, selectedAccount?.address, collectionId, id, token]);

  const backClickHandler = useCallback(() => {
    // if user opened token page with a direct link, redirect him to /market, otherwise redirect him back
    if (history.length > 2) {
      history.back();
    } else {
      navigate('/market');
    }
  }, [navigate]);

  if (!isFetchingOffer && !isFetchingToken && !token && !offer) return <Error404 />;

  // TODO: split into more categories here instead of just "buy/sell" and putting splitting inside them

  return (
    <>
      <BackLink onClick={backClickHandler} data-testid={`${testid}-back-link`}>
        <Icon name='arrow-left' color={BlueGrey500} size={16}></Icon>
        <p>back</p>
      </BackLink>
      <TokenPagePaper>
        <CommonTokenDetail
          token={token}
          offer={offer}
          isLoading={isFetchingOffer || isFetchingToken}
          testid={`${testid}`}
        >
          <TokenTrading
            token={token}
            offer={offer}
            onSellClick={onActionClick(MarketType.sellFix)}
            onBuyClick={onActionClick(MarketType.purchase)}
            onTransferClick={onActionClick(MarketType.transfer)}
            onDelistClick={onActionClick(MarketType.delist)}
            onDelistAuctionClick={onActionClick(MarketType.delistAuction)}
            onPlaceABidClick={onActionClick(MarketType.bid)}
            onWithdrawClick={onActionClick(MarketType.withdrawBid)}
            onAuctionClose={onAuctionClose}
            testid={`${testid}`}
          />
          <TokenPageModal
            token={token}
            offer={offer}
            marketType={marketType}
            onFinish={onFinish}
            onClose={onClose}
            testid={`${testid}`}
          />
        </CommonTokenDetail>
      </TokenPagePaper>
    </>
  );
};

const TokenPagePaper = styled(PagePaper)`
  && {
    margin-top: calc(var(--gap) / 2);
  }
`;

const BackLink = styled.button`
  text-decoration: none;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  font-family: var(--font-inter);
  line-height: 24px;
  color: ${BlueGrey500};
  display: flex;
  gap: 6px;
  width: 60px;
  border: none;
  background: none;
  cursor: pointer;
  p {
    transform: translateY(-3px);
  }
  svg {
    width: 14px;
  }
`;

export default TokenPage;
