import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from '@unique-nft/ui-kit';
import { CollectionInfoWithSchema, TokenByIdResult } from '@unique-nft/substrate-client/tokens';
import { Icon, useNotifications } from 'components/UI';
import { useApi } from 'hooks/useApi';
import { MarketType } from 'types/MarketTypes';
import { CommonTokenDetail } from './TokenDetail/CommonTokenDetail';
import { useOffer } from 'api/restApi/offers/offer';
import { TokenTrading } from './TokenDetail/TokenTrading';
import { Error404 } from '../errors/404';
import TokenPageModal from './Modals/TokenPageModal';
import { PagePaper } from 'components/PagePaper/PagePaper';
import { useAccounts } from 'hooks/useAccounts';
import { shortcutText } from 'utils/textUtils';
import { compareEncodedAddresses, isTokenOwner } from 'api/uniqueSdk/utils/addressUtils';
import styled from 'styled-components';
import { BlueGrey500 } from 'styles/colors';
import BundleTreeSection from './BundleTreeSection';
import { useCollections } from 'hooks/useCollections';

const testid = 'token-page';

const TokenPage = () => {
  const { api, currentChainId } = useApi();
  const { selectedAccount, updateCurrentAccountDeposit } = useAccounts();
  const { id, collectionId } = useParams<{ id: string, collectionId: string}>();
  const [token, setToken] = useState<TokenByIdResult>();
  const [collection, setCollection] = useState<CollectionInfoWithSchema>();
  const [isFetchingToken, setIsFetchingToken] = useState<boolean>(true);
  const { offer, fetch: fetchOffer, isFetching: isFetchingOffer } = useOffer(Number(collectionId), Number(id));
  const { getCollection } = useCollections();
  const [marketType, setMarketType] = useState<MarketType>(MarketType.default);
  const [isBundle, setIsBundle] = useState(false);
  const navigate = useNavigate();
  const { info } = useNotifications();

  const fetchToken = useCallback(async () => {
    if (!api?.nft || !currentChainId) return;
    setIsFetchingToken(true);
    const token = await api.nft?.getToken(Number(collectionId), Number(id));
    setIsBundle(await api.nft?.isBundle(Number(collectionId), Number(id)));

    const collection = await getCollection(Number(collectionId));
    if (token) setToken(token);
    if (collection) setCollection(collection);
    setIsFetchingToken(false);
  }, [api?.nft, currentChainId, collectionId, id]);

  useEffect(() => {
    if (isFetchingOffer) return;
    (async () => {
      if (offer) {
        const collection = await getCollection(Number(collectionId));
        if (collection) setCollection(collection);
        setIsBundle(!!offer.tokenDescription.nestingChildTokens);
      }
      if (!token) await fetchToken();
      if (offer || token) {
        setIsFetchingToken(false);
      }
    })();
  }, [fetchToken, isFetchingOffer, offer, token, collectionId]);

  const onClose = useCallback(() => {
    setMarketType(MarketType.default);
  }, []);

  const onFinish = useCallback(() => {
    if (marketType === MarketType.bid || marketType === MarketType.withdrawBid) {
      void updateCurrentAccountDeposit();
    }

    setMarketType(MarketType.default);
    void fetchToken();
    void fetchOffer(Number(collectionId), Number(id));
  }, [fetchOffer, fetchToken, collectionId, id, marketType, updateCurrentAccountDeposit]);

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
          : `${shortcutText(newOwnerAddress)} is` }  the new owner of <Link href={`/token/${token.collectionId}/${token.tokenId}`} title={`${collection?.tokenPrefix} #${token.tokenId}`}/>
      </div>,
      { name: 'success', size: 32, color: 'var(--color-additional-light)' }
    );

    void fetchOffer(Number(collectionId), Number(id));
    void fetchToken();
  }, [info, fetchOffer, fetchToken, selectedAccount?.address, collectionId, id, token]);

  const backClickHandler = useCallback(() => {
    // if user opened token page with a direct link, redirect him to /market, otherwise redirect him back
    if (history.length > 2) {
      history.back();
    } else {
      navigate('/market');
    }
  }, [navigate]);

  // if we opened child token from bundle which is on sale
  const isIgnoreOffer = useMemo(() => (!(!token || !offer || (id === offer.tokenId.toString() && collectionId === offer.collectionId.toString()))), [token, offer]);

  const isOwner = useMemo(() => {
    if (!selectedAccount || isFetchingOffer || isFetchingToken) return false;
    if (offer) {
      return isTokenOwner(selectedAccount.address, offer.seller);
    }
    return token?.owner ? isTokenOwner(selectedAccount.address, token.owner) : false;
  }, [isFetchingOffer, isFetchingToken, selectedAccount, token, offer]);

  if (!isFetchingOffer && !isFetchingToken && !token && !offer) return <Error404 />;

  // TODO: split into more categories here instead of just "buy/sell" and putting splitting inside them

  return (
    <>
      <BackLink onClick={backClickHandler} data-testid={`${testid}-back-link`}>
        <Icon name='arrow-left' color={BlueGrey500} size={16}/>
        <p>back</p>
      </BackLink>
      <TokenPagePaper>
        <CommonTokenDetail
          token={token}
          collection={collection}
          offer={!isIgnoreOffer ? offer : undefined}
          isLoading={isFetchingOffer || isFetchingToken}
          testid={`${testid}`}
          isBundle={isBundle}
          isOwner={isOwner}
        >
          <TokenTrading
            token={token}
            offer={!isIgnoreOffer ? offer : undefined}
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
            collection={collection}
            offer={!isIgnoreOffer ? offer : undefined}
            marketType={marketType}
            onFinish={onFinish}
            onClose={onClose}
            testid={`${testid}`}
          />
        </CommonTokenDetail>
      </TokenPagePaper>
      {isBundle && <BundleTreeSection
        onViewTokenDetails={setToken}
        token={token}
        offer={offer}
        testid={`${testid}-bundle`}
        isOwner={isOwner}
      />}
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
