import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useApi } from '../../hooks/useApi';
import { NFTToken } from '../../api/chainApi/unique/types';
import { MarketType } from '../../types/MarketTypes';
import { CommonTokenDetail } from './TokenDetail/CommonTokenDetail';
import { useOffer } from '../../api/restApi/offers/offer';
import { TokenTrading } from './TokenDetail/TokenTrading';
import { Error404 } from '../errors/404';
import Loading from '../../components/Loading';
import TokenPageModal from './Modals/TokenPageModal';

const TokenPage = () => {
  const { api } = useApi();
  const { id, collectionId } = useParams<{ id: string, collectionId: string}>();
  const [token, setToken] = useState<NFTToken>();
  const [loading, setLoading] = useState<boolean>(false);
  const { offer, fetch: fetchOffer } = useOffer(Number(collectionId), Number(id));
  const [marketType, setMarketType] = useState<MarketType>(MarketType.default); // TODO: when "sell"/"buy"/"bid"/etc clicked - update this status to open modal

  const fetchToken = useCallback(() => {
    if (!api) return;
    setLoading(true);
    api?.nft?.getToken(Number(collectionId), Number(id)).then((token: NFTToken) => {
      setToken(token);
      setLoading(false);
    }).catch((error) => {
      console.log('Get token from RPC failed', error);
    });
  }, [api, collectionId, id]);

  // TODO: debug purposes, should be taken from API instead of RPC
  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  const onFinish = useCallback(() => {
    setMarketType(MarketType.default);
    fetchToken();
    fetchOffer(Number(collectionId), Number(id));
  }, [fetchOffer, fetchToken, collectionId, id]);

  const onSellClick = useCallback(() => {
    setMarketType(MarketType.sellFix);
  }, []);

  const onTransferClick = useCallback(() => {
    setMarketType(MarketType.transfer);
  }, []);

  const onDelistClick = useCallback(() => {
    setMarketType(MarketType.delist);
  }, []);

  const onBuyClick = useCallback(() => {
    setMarketType(MarketType.purchase);
  }, []);

  const onPlaceABidClick = useCallback(() => {
    setMarketType(MarketType.bid);
  }, []);

  const onWithdrawClick = useCallback(() => {
    // TODO: withdraw
  }, []);

  if (loading) return <Loading />;
  else if (!token) return <Error404 />;

  // TODO: split into more categories here instead of just "buy/sell" and putting splitting inside them

  return (<CommonTokenDetail token={token}>
    <TokenTrading
      token={token}
      offer={offer}
      onSellClick={onSellClick}
      onBuyClick={onBuyClick}
      onTransferClick={onTransferClick}
      onDelistClick={onDelistClick}
      onPlaceABidClick={onPlaceABidClick}
      onWithdrawClick={onWithdrawClick}
    />
    <TokenPageModal
      token={token}
      offer={offer}
      marketType={marketType}
      onFinish={onFinish}
    />
  </CommonTokenDetail>);
};

export default TokenPage;
