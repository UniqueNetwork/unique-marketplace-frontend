import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from '@unique-nft/ui-kit';

import { useApi } from '../../hooks/useApi';
import { NFTToken } from '../../api/chainApi/unique/types';
import { MarketType } from '../../types/MarketTypes';
import { CommonTokenDetail } from './TokenDetail/CommonTokenDetail';
import { useOffer } from '../../api/restApi/offers/offer';
import { TokenTrading } from './TokenDetail/TokenTrading';
import { Error404 } from '../errors/404';
import Loading from '../../components/Loading';
import TokenPageModal from './Modals/TokenPageModal';
import { PagePaper } from '../../components/PagePaper/PagePaper';
import { useNotification } from '../../hooks/useNotification';
import { NotificationSeverity } from '../../notification/NotificationContext';
import { useAccounts } from '../../hooks/useAccounts';
import { shortcutText } from '../../utils/textUtils';
import { compareEncodedAddresses } from '../../api/chainApi/utils/addressUtils';

const TokenPage = () => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const { id, collectionId } = useParams<{ id: string, collectionId: string}>();
  const [token, setToken] = useState<NFTToken>();
  const [loading, setLoading] = useState<boolean>(true);
  const { offer, fetch: fetchOffer, isFetching: isFetchingOffer } = useOffer(Number(collectionId), Number(id));
  const [marketType, setMarketType] = useState<MarketType>(MarketType.default); // TODO: when "sell"/"buy"/"bid"/etc clicked - update this status to open modal

  const { push } = useNotification();

  const fetchToken = useCallback(() => {
    if (!api) return;
    setLoading(true);
    if (offer || token || isFetchingOffer) {
      setLoading(false);
      return;
    }
    api?.nft?.getToken(Number(collectionId), Number(id)).then((token: NFTToken) => {
      setToken(token);
      setLoading(false);
    }).catch((error) => {
      console.log('Get token from RPC failed', error);
    });
  }, [api, collectionId, id, offer, token, isFetchingOffer]);

  // TODO: debug purposes, should be taken from API instead of RPC
  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  const onClose = useCallback(() => {
    setMarketType(MarketType.default);
  }, []);

  const onFinish = useCallback(() => {
    setMarketType(MarketType.default);
    fetchToken();
    fetchOffer(Number(collectionId), Number(id));
  }, [fetchOffer, fetchToken, collectionId, id]);

  const onActionClick = useCallback((action: MarketType) => () => {
    setMarketType(action);
  }, []);

  const onAuctionClose = useCallback((newOwnerAddress: string) => {
    if (!token) return;
    push({
      severity: NotificationSeverity.success,
      message: <>{compareEncodedAddresses(newOwnerAddress, selectedAccount?.address || '') ? 'You are' : `${shortcutText(newOwnerAddress)} is` }  the new owner of <Link href={`/token/${token.collectionId}/${token.id}`} title={`${token.prefix} #${token.id}`}/></>
    });
    fetchOffer(Number(collectionId), Number(id));
    fetchToken();
  }, [push, fetchOffer, fetchToken, selectedAccount?.address, collectionId, id, token]);

  if (loading || isFetchingOffer) return <Loading />;
  else if (!token && !offer) return <Error404 />;

  // TODO: split into more categories here instead of just "buy/sell" and putting splitting inside them

  return (<PagePaper>
    <CommonTokenDetail token={token} offer={offer}>
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
      />
      <TokenPageModal
        token={token}
        offer={offer}
        marketType={marketType}
        onFinish={onFinish}
        onClose={onClose}
      />
    </CommonTokenDetail>
  </PagePaper>
  );
};

export default TokenPage;
