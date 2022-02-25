import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useApi } from '../../hooks/useApi';
import { CommonTokenDetail } from './TokenDetail/CommonTokenDetail';
import { NFTToken } from '../../api/chainApi/unique/types';
import accountContext from '../../account/AccountContext';
import { SellToken } from './SellToken/SellToken';
import { BuyToken } from './BuyToken/BuyToken';
import TokenPageModal from './Modals/TokenPageModal';
import { useOffer } from '../../api/restApi/offers/offer';
import { MarketType } from '../../types/MarketTypes';
import Loading from '../../components/Loading';
import { Error404 } from '../errors/404';

// http://localhost:3000/token/124/173
const TokenPage = () => {
  const { api } = useApi();
  const { id, collectionId } = useParams<{ id: string, collectionId: string}>();
  const [token, setToken] = useState<NFTToken>();
  const [loading, setLoading] = useState<boolean>(false);
  const { offer } = useOffer(Number(collectionId), Number(id));
  const [marketType, setMarketType] = useState<MarketType>(MarketType.default); // TODO: when "sell"/"buy"/"bid"/etc clicked - update this status to open modal

  const { selectedAccount } = useContext(accountContext);

  // TODO: debug purposes, should be taken from API instead of RPC
  useEffect(() => {
    if (!api) return;
    setLoading(true);
    api?.nft?.getToken(Number(collectionId), Number(id)).then((token) => {
      setToken(token);
      setLoading(false);
    }).catch((error) => {
      console.log('Get token from RPC failed', error);
    });
  }, [api]);

  const onFinish = useCallback(() => {
    setMarketType(MarketType.default);
  }, []);

  const isOwner = useMemo(() => {
    if (!selectedAccount || !token?.owner) return false;
    return api?.market?.isTokenOwner(selectedAccount.address, token.owner);
  }, [selectedAccount, token, api?.market]);

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

  if (loading) return <Loading />;
  else if (!token) return <Error404 />;

  // TODO: split into more categories here instead of just "buy/sell" and putting splitting inside them
  return (<CommonTokenDetail token={token}>
    <>
      {isOwner
        ? <SellToken
            token={token}
            offer={offer}
            onSellClick={onSellClick}
            onTransferClick={onTransferClick}
            onDelistClick={onDelistClick}
          />
        // TODO: should not depend on token (we have seller in offer)
        : <BuyToken offer={offer} token={token} onBuyClick={onBuyClick} />}
      <TokenPageModal
        token={token}
        offer={offer}
        marketType={marketType}
        onFinish={onFinish}
      />
    </>
  </CommonTokenDetail>);
};

export default TokenPage;
