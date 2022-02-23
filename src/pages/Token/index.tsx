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

// http://localhost:3000/token/124/173
const TokenPage = () => {
  const { api } = useApi();
  const { id, collectionId } = useParams<{ id: string, collectionId: string}>();
  const [token, setToken] = useState<NFTToken>();
  const { offer } = useOffer(Number(collectionId), Number(id));
  const [marketType, setMarketType] = useState<MarketType>(MarketType.default); // TODO: when "sell"/"buy"/"bid"/etc clicked - update this status to open modal

  const { selectedAccount } = useContext(accountContext);

  // TODO: debug purposes, should be taken from API instead of RPC
  useEffect(() => {
    if (!api) return;
    api?.nft?.getToken(Number(collectionId), Number(id)).then((token) => {
      setToken(token);
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

  // TODO: 404 instead
  if (!token || !offer) return null;

  // TODO: split into more categories here instead of just "buy/sell" and putting splitting inside them
  return (<CommonTokenDetail token={token}>
    <>
      {isOwner
        ? <SellToken offer={offer} />
        // TODO: should not depend on token (we have seller in offer)
        : <BuyToken offer={offer} token={token} />}
      <TokenPageModal offer={offer} marketType={marketType} onFinish={onFinish} />
    </>
  </CommonTokenDetail>);
};

export default TokenPage;
