import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { keyring } from '@polkadot/ui-keyring';
import { useNotifications } from '@unique-nft/ui-kit';
import { ApiContextProps, ApiProvider } from './ApiContext';
import AuctionSocketProvider from './restApi/auction/AuctionSocketProvider';
import { Settings } from './restApi/settings/types';
import { SdkClient } from './sdk/sdkClient';
import { UniqueSDKNFTController } from './uniqueSdk/NFTController';
import { UniqueSDKCollectionController } from './uniqueSdk/collectionController';
import { UniqueSDKMarketController } from './uniqueSdk/marketController';
import { ChainProperties } from '@unique-nft/substrate-client/types';
import config from '../config';
import axios from '../api/restApi/base/axios';
import { sdkClient as sdk, nftController as nft, collectionController as collection, marketController as market } from '.';
import { getSettings } from './restApi/settings/settings';

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
  const [currentChainId, setCurrentChainId] = useState<string>('');
  const { error } = useNotifications();

  useEffect(() => {
    (async () => {
      // mock received settings

      const defaultChainId = Object.keys(config?.blockchains || {})[0];
      const storedChainId = localStorage.getItem(ChainIdLocalStorageKey);

      if (!storedChainId || (chainIdParam && storedChainId !== chainIdParam)) {
        defaultChainId && localStorage.setItem(ChainIdLocalStorageKey, chainIdParam || defaultChainId);
      }

      const initialChainId = chainIdParam || storedChainId || defaultChainId;
      setCurrentChainId(initialChainId);

      axios.defaults.baseURL = config.blockchains[initialChainId].apiEndpoint;

      const { data: settings } = await getSettings();

      await sdkClient?.connect(
        initialChainId,
        settings.blockchain.unique.wsEndpoint,
        settings.blockchain.kusama.wsEndpoint
      );

      setSettings(settings);
      initializeControllers(initialChainId, sdkClient, settings);
      setRpcClientInitialized(sdkClient?.isReady);
    })().then(() => {
      console.log('Rpc connection: success');
    }).catch((e) => {
      error('Rpc connection: failed', { name: 'warning', size: 16 });
      console.log('Rpc connection: failed', e);
    });
  }, []);

  const initializeControllers = useCallback(async (chainId: string, sdkClient: SdkClient, settings: Settings) => {
    if (!sdkClient?.sdkSet[chainId]) {
      setRpcClientInitialized(false);
      await sdkClient?.connect(
        chainId,
        settings.blockchain.unique.wsEndpoint,
        settings.blockchain.kusama.wsEndpoint
      );
      setRpcClientInitialized(sdkClient?.isReady);
    }

    const currentChain = sdkClient?.sdkSet[chainId];

    if (!currentChain) return;

    nftController?.initialize({
      sdk: currentChain.unique,
      allowedTokens: settings.blockchain.unique.allowedTokens,
      collectionIds: settings.blockchain.unique.collectionIds
    });
    collectionController?.initialize({
      sdk: currentChain.unique,
      collectionIds: settings.blockchain.unique.collectionIds
    });
    marketController?.initialize({
      uniqueSdk: currentChain.unique,
      kusamaSdk: currentChain.kusama,
      auctionAddress: settings.auction.address,
      contractAddress: settings.blockchain.unique.contractAddress,
      escrowAddress: settings.blockchain.escrowAddress,
      wsEndpoint: settings.blockchain.unique.wsEndpoint
    });
  }, []);

  const onChangeChainId = useCallback(async (newChainId: string) => {
    if (currentChainId === newChainId) return;
    axios.defaults.baseURL = config.blockchains[newChainId].apiEndpoint;

    const { data: settings } = await getSettings();
    setSettings(settings);

    await initializeControllers(newChainId, sdkClient, settings);
    setCurrentChainId(newChainId);
    // redirect to correct URL with chainId
    const { pathname } = window.location;
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
  }, [currentChainId, sdkClient, settings]);

  // get current chain and current chain settings
  const currentChain = useMemo(() => {
    if (!sdkClient?.isReady || !currentChainId) return undefined;

    return sdkClient?.sdkSet[currentChainId];
  }, [currentChainId, sdkClient?.isReady]);

  useEffect(() => {
    if (sdkClient?.error) {
      error(sdkClient?.error, { name: 'warning', size: 16 });
    }
  }, [sdkClient?.error]);

  // get context value for ApiContext
  const value = useMemo<ApiContextProps>(
    () => ({
      api: (isRpcClientInitialized && settings && currentChain && settings
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
    [isRpcClientInitialized, currentChain, settings, currentChainId]
  );

  return (
    <ApiProvider value={value}>
      <AuctionSocketProvider url={config.blockchains[currentChainId]?.apiEndpoint}>
        {children}
      </AuctionSocketProvider>
    </ApiProvider>
  );
};

export default ApiWrapper;
