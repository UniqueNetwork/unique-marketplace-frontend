import { CollectionWithInfoV2Dto, TokenChildrenResponse, TokenWithInfoV2Dto } from '@unique-nft/sdk';
import { Address } from '@unique-nft/utils';
import { isTokenOwner } from 'api/chainApi/utils/addressUtils';
import { useOffer } from 'api/restApi/offers/offer';
import { INestingToken } from 'components/BundleTree/types';
import { useAccounts } from 'hooks/useAccounts';
import { useApi } from 'hooks/useApi';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Fraction, TokenContextValue } from './types';
import { mockWearables } from '../constants';

export const TokenContext = React.createContext<TokenContextValue>({
  isFetching: true,
  isBundle: false,
  isNested: false,
  isOwner: false,
  isRft: false,
  isRftFracton: false,
  isWearable: false,
  isCustomizable: false,
  fetchTokenError: '',
  fetchToken: () => Promise.resolve(),
  fetchOffer: () => Promise.resolve()
});

export const TokenContextProvider: FC = ({ children }) => {
  const { api, currentChainId } = useApi();
  const { selectedAccount } = useAccounts();
  const navigate = useNavigate();
  const { address, id: tokenIdParam, collectionId: collectionIdParam } = useParams<{ address: string, id: string, collectionId: string}>();
  const [collectionId, tokenId] = [Number(collectionIdParam), Number(tokenIdParam)];

  const [token, setToken] = useState<TokenWithInfoV2Dto>();
  const [collection, setCollection] = useState<CollectionWithInfoV2Dto>();
  const [isFetchingToken, setIsFetchingToken] = useState(true);
  const { offer, fetch: fetchOffer, isFetching: isFetchingOffer } = useOffer(collectionId, tokenId);
  const [isFetchingBundle, setIsFetchingBundle] = useState(false);
  const [bundle, setBundle] = useState<TokenChildrenResponse>();
  const [isNested, setIsNested] = useState(false);
  const [fraction, setFraction] = useState<Fraction>();
  const [topmostOwner, setTopmostOwner] = useState<string>();
  const [fetchTokenError, setFetchTokenError] = useState<string>();

  const fetchToken = useCallback(async () => {
    setFetchTokenError('');
    if (!api?.nft || !api?.rft) return;
    setIsFetchingToken(true);
    let token;
    try {
      token = await api.nft?.getTokenV2(collectionId, tokenId);
    } catch(err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Unknown error';
      setFetchTokenError(errorMessage);
    }

    setToken(token || undefined);
    const collection = await api.collection?.getCollection(collectionId);
    setCollection(collection || undefined);

    if (!token || !collection) {
      setIsFetchingToken(false);
      return;
    }

    let isBundle;
    let isNested;
    setFraction(undefined);
    setBundle(undefined);
    setTopmostOwner(undefined);
    // is RFT
    if (collection?.mode === 'ReFungible') {
      const totalPieces = (await api.rft?.getTokenTotalPieces(collectionId, tokenId))?.amount || 0;
      setFraction({ amount: 0, totalPieces });
      // is Fraction
      if (address) {
        isNested = Address.is.nestingAddress(address);
        const amount = (await api.rft?.getTokenBalance(collectionId, tokenId, address))?.amount || 0;
        setFraction({ amount, totalPieces });

        if (amount === 0) {
          if (selectedAccount?.address && selectedAccount.address !== address) {
            navigate(`/${currentChainId}/token/${selectedAccount.address}/${collectionId}/${tokenId}`);
          } else {
            navigate(`/${currentChainId}/token/${collectionId}/${tokenId}`);
          }
        }

        if (isNested) {
          setToken({ ...token, owner: address });
        }
      }
    } else { // is NFT
      isBundle = await api.nft?.isBundle(collectionId, tokenId);
      isNested = token?.nestingParentToken;
    }

    setIsFetchingToken(false);
    setIsNested(!!isNested);
    if (isBundle || isNested) {
      setIsFetchingBundle(true);
      const bundle = (await api?.nft?.getChildren(collectionId, tokenId)) || undefined;

      if (isNested) {
        const parent = address ? Address.nesting.addressToIds(address) : token.nestingParentToken;
        setTopmostOwner((await api.nft?.getTopmostOwner(parent.collectionId, parent.tokenId))?.topmostOwner || undefined);
      }
      setBundle(bundle);
      setIsFetchingBundle(false);
    } else {
      setBundle(undefined);
    }
  }, [api?.nft, api?.rft, api?.collection, collectionId, tokenId, address, currentChainId]);

  useEffect(() => {
    void fetchToken();
  }, [fetchToken]);

  const isOwner = useMemo(() => {
    if (!selectedAccount || isFetchingOffer || isFetchingToken) return false;
    if (topmostOwner) return isTokenOwner(selectedAccount.address, topmostOwner);
    if (collection?.mode === 'ReFungible' && address) {
      return isTokenOwner(selectedAccount.address, address);
    }

    if (offer) {
      return isTokenOwner(selectedAccount.address, offer.seller);
    }

    return token?.owner ? isTokenOwner(selectedAccount.address, token.owner) : false;
  }, [isFetchingOffer, isFetchingToken, selectedAccount, token, offer, topmostOwner, collection, address]);

  const value = useMemo<TokenContextValue>(() => {
    return {
      token,
      collection,
      offer,
      bundle: bundle, // ? addIsCurrentAccountOwnerToBundleAndSort(bundle, isOwner) : undefined,
      topmostOwner,
      isBundle: !!bundle,
      isNested,
      isRft: collection?.mode === 'ReFungible',
      isRftFracton: collection?.mode === 'ReFungible' && !!address,
      isFetching: isFetchingToken || isFetchingOffer || isFetchingBundle,
      isOwner,
      ownerAddress: token?.owner,
      fraction,
      fetchTokenError,
      fetchToken,
      fetchOffer: async () => { await fetchOffer(collectionId, tokenId); },
      isWearable: !!mockWearables[currentChainId || '']?.find(({ collectionId }) => collectionId === collection?.collectionId),
      isCustomizable: !!collection?.properties.find(({ key }) => key === 'is_customizable')?.value
    };
  }, [token, collection, offer, bundle, topmostOwner, isNested, address, isFetchingToken, isFetchingOffer, isFetchingBundle, isOwner, fraction, fetchToken, currentChainId, fetchOffer, collectionId, tokenId, fetchTokenError]);

  return <TokenContext.Provider value={value} >
    {children}
  </TokenContext.Provider>;
};

const addIsCurrentAccountOwnerToBundleAndSort = (bundle: INestingToken, isOwner: boolean, parent?: INestingToken) => {
  bundle.isCurrentAccountOwner = isOwner;
  bundle.nestingParentToken = parent;
  if (bundle.nestingChildTokens?.length === 0) return bundle;
  bundle.nestingChildTokens = bundle.nestingChildTokens?.sort((a, b) => a.tokenId > b.tokenId ? 1 : -1).map((token) => addIsCurrentAccountOwnerToBundleAndSort(token, isOwner, bundle));
  bundle.opened = true;
  return bundle;
};
