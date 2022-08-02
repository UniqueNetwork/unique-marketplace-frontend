import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { keyring } from '@polkadot/ui-keyring';
import { useNotifications } from '@unique-nft/ui-kit';
import { ApiContextProps, ApiProvider } from './ApiContext';
import AuctionSocketProvider from './restApi/auction/AuctionSocketProvider';
import { ChainSettings, Settings } from './restApi/settings/types';
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
  const { chainId } = useParams<'chainId'>();
  const [settings, setSettings] = useState<Settings>();
  const { error } = useNotifications();

  useEffect(() => {
    (async () => {
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

  const currentChainId = useMemo(() => {
    const defaultChainId = Object.keys(settings?.blockchains || {})[0];
    const localChainId = localStorage.getItem(ChainIdLocalStorageKey);

    if (!localChainId || (chainId && localChainId !== chainId)) {
      defaultChainId && localStorage.setItem(ChainIdLocalStorageKey, chainId || defaultChainId);
    }
    return chainId || localChainId || defaultChainId;
  }, [settings, chainId]);

  const currentChain = useMemo(() => {
    if (!sdkClient?.isReady) return;
    return sdkClient?.sdkSet[currentChainId];
  }, [currentChainId, sdkClient?.isReady]);

  const currentSettings: ChainSettings | undefined = useMemo(() => {
    return currentChainId ? settings?.blockchains[currentChainId] : undefined;
  }, [settings, currentChainId]);

  useEffect(() => {
    if (!currentChain || !currentSettings) return;
    nftController?.initiate({
      sdk: currentChain.unique,
      allowedTokens: currentSettings.blockchain.unique.allowedTokens,
      collectionIds: currentSettings.blockchain.unique.collectionIds
    });
    collectionController?.initiate({
      sdk: currentChain.unique,
      collectionIds: currentSettings.blockchain.unique.collectionIds
    });
    marketController?.initiate({
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
      currentChainId
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
