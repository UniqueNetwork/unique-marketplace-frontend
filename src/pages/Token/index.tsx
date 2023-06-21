import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from '@unique-nft/ui-kit';
import { Icon, useNotifications } from 'components/UI';
import { useApi } from 'hooks/useApi';
import { MarketType } from 'types/MarketTypes';
import { CommonTokenDetail } from './TokenDetail/CommonTokenDetail';
import { useOffer } from 'api/restApi/offers/offer';
import { TokenTrading } from './TokenDetail/TokenTrading';
import { Error404 } from '../Errors/404';
import TokenPageModal from './Modals/TokenPageModal';
import { PagePaper } from 'components/PagePaper/PagePaper';
import { useAccounts } from 'hooks/useAccounts';
import { shortcutText } from 'utils/textUtils';
import { compareEncodedAddresses, isTokenOwner } from 'api/chainApi/utils/addressUtils';
import styled from 'styled-components';
import { BlueGrey500 } from 'styles/colors';
import BundleTreeSection from './BundleTreeSection';
import { useCollections } from 'hooks/useCollections';
import { CollectionInfoWithSchemaResponse, TokenByIdResponse } from '@unique-nft/sdk';
import { NestedTokenBlock } from './TokenDetail/NestedTokenBlock';
import BundleModal from './BundleModals/BundleTrunsferModal';
import { BundleModalType } from './BundleModals/types';
import { NestingTokenBlock } from './TokenDetail/NestingBlock';

const testid = 'token-page';

const TokenPage = () => {
  const { api, currentChainId } = useApi();
  const { selectedAccount, updateCurrentAccountDeposit } = useAccounts();
  const { id, collectionId } = useParams<{ id: string, collectionId: string}>();
  const [token, setToken] = useState<TokenByIdResponse>();
  const [collection, setCollection] = useState<CollectionInfoWithSchemaResponse | null>(null);
  const [isFetchingToken, setIsFetchingToken] = useState<boolean>(true);
  const { offer, fetch: fetchOffer, isFetching: isFetchingOffer } = useOffer(Number(collectionId), Number(id));
  const { getCollection } = useCollections();
  const [marketType, setMarketType] = useState<MarketType>(MarketType.default);
  const [isBundle, setIsBundle] = useState(false);
  const [isNested, setIsNested] = useState(false);
  const [topmostOwner, setTopmostOwner] = useState<string | null>(null);
  const navigate = useNavigate();
  const { info } = useNotifications();

  const fetchToken = useCallback(async () => {
    if (!api?.nft || !currentChainId) return;
    setIsFetchingToken(true);
    try {
      const token = await api.nft?.getToken(Number(collectionId), Number(id));
      setIsBundle(await api.nft?.isBundle(Number(collectionId), Number(id)));
      if (token?.nestingParentToken) {
        setIsNested(true);
        setTopmostOwner((await api.nft.getTopmostOwner(Number(collectionId), Number(id)))?.topmostOwner || null);
      } else {
        setIsNested(false);
        setTopmostOwner(null);
      }
      const collection = await getCollection(Number(collectionId));
      if (token) setToken(token);
      if (collection) setCollection(collection);
    } catch (e) {
      console.error('error while fetching token or collection from RPC', e);
    }
    setIsFetchingToken(false);
  }, [api?.nft, currentChainId, collectionId, id, getCollection]);

  useEffect(() => {
    if (isFetchingOffer) return;
    void (async () => {
      if (offer) {
        const collection = await getCollection(Number(collectionId));
        if (collection) setCollection(collection);
        setIsBundle(!!offer.tokenDescription?.nestingChildTokens?.length);
      }
      if (!token) await fetchToken();
      if (offer || token) {
        setIsFetchingToken(false);
        setIsNested(!!token?.nestingParentToken);
      }
    })();
  }, [fetchToken, isFetchingOffer, offer, token, collectionId, getCollection]);

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
  }, [info, fetchOffer, fetchToken, selectedAccount?.address, collectionId, id, token, collection]);

  const backClickHandler = useCallback(() => {
    // if user opened token page with a direct link, redirect him to /market, otherwise redirect him back
    if (history.length > 2) {
      history.back();
    } else {
      navigate('/market');
    }
  }, [navigate]);

  // TODO: rework this one
  // if we opened child token from bundle which is on sale
  const isIgnoreOffer = false; // useMemo(() => (!(!token || !offer || (id === offer.tokenId.toString() && collectionId === offer.collectionId.toString()))), [token, offer, collectionId, id]);

  const isOwner = useMemo(() => {
    if (!selectedAccount || isFetchingOffer || isFetchingToken) return false;
    if (offer) {
      return isTokenOwner(selectedAccount.address, offer.seller);
    }
    if (topmostOwner) return isTokenOwner(selectedAccount.address, topmostOwner);

    return token?.owner ? isTokenOwner(selectedAccount.address, token.owner) : false;
  }, [isFetchingOffer, isFetchingToken, selectedAccount, token, offer, topmostOwner]);

  if (!isFetchingOffer && !isFetchingToken && !token && !offer) return <Error404 />;

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
          isNested={isNested}
          isOwner={isOwner}
        >
          {isOwner && isNested && <NestedTokenBlock
            token={token}
            onTransferClick={onActionClick(MarketType.nestedTransfer)}
            onUnnestClick={onActionClick(MarketType.unnest)}
            testid={`${testid}`}
          />}
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
          {isOwner && !offer && !isNested && <NestingTokenBlock
            token={token}
            onNestClick={onActionClick(MarketType.nestedTransfer)}
            testid={`${testid}`}
          />}
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
      {isBundle &&
        <BundleTreeSection
          onViewTokenDetails={setToken}
          token={token}
          offer={offer}
          testid={`${testid}-bundle`}
          isOwner={isOwner}
        />
      }
      <BundleModal
        token={token}
        bundleModalType={
          marketType === MarketType.nestedTransfer ||
          marketType === MarketType.unnest
            ? marketType as unknown as BundleModalType
            : BundleModalType.default }
        onFinish={onFinish}
        testid={`${testid}-modal`}
        onClose={onClose}
      />
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
