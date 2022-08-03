import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { keyring } from '@polkadot/ui-keyring';
import { useNotifications } from '@unique-nft/ui-kit';
import { ApiContextProps, ApiProvider } from './ApiContext';
import AuctionSocketProvider from './restApi/auction/AuctionSocketProvider';
import { Settings } from './restApi/settings/types';
import { SdkClient } from './sdk/sdkClient';
import { UniqueSDKNFTController } from './uniqueSdk/NFTController';
import { UniqueSDKCollectionController } from './uniqueSdk/collectionController';
import { UniqueSDKMarketController } from './uniqueSdk/marketController';
import config from '../config';
import { sdkClient as sdk, nftController as nft, collectionController as collection, marketController as market } from '.';

import mockSettings from './mockSettings.json';

keyring.loadAll({});

const ChainIdLocalStorageKey = 'unique_market_chain_id';

interface ChainProviderProps {
  children: React.ReactNode
  sdkClient?: SdkClient
  nftController?: UniqueSDKNFTController
  collectionController?: UniqueSDKCollectionController
  marketController?: UniqueSDKMarketController
}

const ApiWrapper = ({
  children,
  sdkClient = sdk,
  nftController = nft,
  collectionController = collection,
  marketController = market
}: ChainProviderProps) => {
  const [isRpcClientInitialized, setRpcClientInitialized] = useState<boolean>(false);
  const navigate = useNavigate();
  const { chainId: chainIdParam } = useParams<'chainId'>();
  const [settings, setSettings] = useState<Settings>();
  const [currentChainId, setCurrentChainId] = useState<string>();
  const { error } = useNotifications();

  useEffect(() => {
    (async () => {
      // mock received settings
      // const { data: settings } = await getSettings();
      const settings: Settings = await Promise.resolve(mockSettings);
      setSettings(mockSettings);

      for (const chainId in settings.blockchains) {
        const { unique, kusama } = settings.blockchains[chainId].blockchain;
        await sdkClient?.connect(
          chainId,
          unique.wsEndpoint,
          kusama.wsEndpoint
        );
      }

      setRpcClientInitialized(sdkClient?.isReady);
    })().then(() => {
      console.log('Rpc connection: success');
    }).catch((e) => {
      error('Rpc connection: failed', { name: 'warning', size: 16 });
      console.log('Rpc connection: failed', e);
    });
  }, []);

  // effect that track changes to chainId in the URL
  useEffect(() => {
    if (!settings) return;
    if (chainIdParam && !settings?.blockchains[chainIdParam]) {
      navigate('/404');
      return;
    }
    const defaultChainId = Object.keys(settings?.blockchains || {})[0];
    const storedChainId = localStorage.getItem(ChainIdLocalStorageKey);

    if (!storedChainId || (chainIdParam && storedChainId !== chainIdParam)) {
      defaultChainId && localStorage.setItem(ChainIdLocalStorageKey, chainIdParam || defaultChainId);
    }

    const initialChainId = chainIdParam || storedChainId || defaultChainId;
    setCurrentChainId((currentChainId) => currentChainId && initialChainId && currentChainId === initialChainId ? currentChainId : initialChainId);
  }, [settings, chainIdParam]);

  const onChangeChainId = useCallback((newChainId: string, pathname: string) => {
    if (currentChainId === newChainId) return;
    setCurrentChainId(newChainId);
    // redirect to correct URL with chainId
    if (pathname.includes('faq')) return;
    const tokenPageUrlRegex = /token[/]\d+[/]\d+$/;
    if (tokenPageUrlRegex.test(pathname)) {
      navigate(`/${newChainId}/market`);
      return;
    }
    if (currentChainId && pathname.includes(currentChainId)) {
      navigate(pathname.replace(currentChainId, newChainId));
    } else {
      navigate(`/${newChainId}${pathname}`);
    }
  }, [currentChainId, navigate]);

  // get current chain and current chain settings
  const [currentChain, currentSettings] = useMemo(() => {
    if (!sdkClient?.isReady || !currentChainId) return [];
    return [
      sdkClient?.sdkSet[currentChainId],
      currentChainId ? settings?.blockchains[currentChainId] : undefined
    ];
  }, [currentChainId, settings, sdkClient?.isReady]);

  // effect to reinitialize controllers if currentChainId has changed
  useEffect(() => {
    if (!currentChain || !currentSettings) return;
    nftController?.initialize({
      sdk: currentChain.unique,
      allowedTokens: currentSettings.blockchain.unique.allowedTokens,
      collectionIds: currentSettings.blockchain.unique.collectionIds
    });
    collectionController?.initialize({
      sdk: currentChain.unique,
      collectionIds: currentSettings.blockchain.unique.collectionIds
    });
    marketController?.initialize({
      uniqueSdk: currentChain.unique,
      kusamaSdk: currentChain.kusama,
      auctionAddress: currentSettings.auction.address,
      contractAddress: currentSettings.blockchain.unique.contractAddress,
      escrowAddress: currentSettings.blockchain.escrowAddress,
      wsEndpoint: currentSettings.blockchain.unique.wsEndpoint
    });
  }, [currentChain, currentSettings]);

  useEffect(() => {
    if (sdkClient?.error) {
      error(sdkClient?.error, { name: 'warning', size: 16 });
    }
  }, [sdkClient?.error]);

  // get context value for ApiContext
  const value = useMemo<ApiContextProps>(
    () => ({
      api: (isRpcClientInitialized && settings && currentChain && currentSettings
        ? {
          collection: collectionController,
          nft: nftController,
          market: marketController
        }
        : undefined),
      uniqueSdk: currentChain?.unique,
      kusamaSdk: currentChain?.kusama,
      chainData: currentChain?.unique.chainProperties(),
      settings,
      currentChainId,
      onChangeChainId
    }),
    [isRpcClientInitialized, currentChain, settings, currentChainId, currentSettings]
  );

  return (
    <ApiProvider value={value}>
      <AuctionSocketProvider url={config.uniqueApiUrl}>
        {children}
      </AuctionSocketProvider>
    </ApiProvider>
  );
};

export default ApiWrapper;
