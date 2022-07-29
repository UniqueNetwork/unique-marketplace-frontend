import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { keyring } from '@polkadot/ui-keyring';
import { useNotifications } from '@unique-nft/ui-kit';
import { ApiContextProps, ApiProvider } from './ApiContext';
// import { getSettings } from './restApi/settings/settings';
import AuctionSocketProvider from './restApi/auction/AuctionSocketProvider';
import { Settings } from './restApi/settings/types';
import { SdkClient } from './sdk/sdkClient';
import { UniqueSDKNFTController } from './uniqueSdk/NFTController';
import { UniqueSDKCollectionController } from './uniqueSdk/collectionController';
import { UniqueSDKMarketController } from './uniqueSdk/marketController';
import config from '../config';

import mockSettings from './mockSettings.json';

import { sdkClient as sdk } from '.';

keyring.loadAll({});

interface ChainProviderProps {
  children: React.ReactNode
  sdkClient?: SdkClient
}

const ApiWrapper = ({ children, sdkClient = sdk }: ChainProviderProps) => {
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

  useEffect(() => {
    if (sdkClient?.error) {
      error(sdkClient?.error, { name: 'warning', size: 16 });
    }
  }, [sdkClient?.error]);

  const currentChainId = useMemo(() => chainId || Object.keys(settings?.blockchains || {})[0], [settings, chainId]);

  const currentChain = useMemo(() => {
    if (!sdkClient?.isReady) return;
    return sdkClient?.sdkSet[currentChainId];
  }, [currentChainId, sdkClient?.isReady]);

  const currentSettings = useMemo(() => {
    return currentChainId ? settings?.blockchains[currentChainId] : undefined;
  }, [settings, currentChainId]);

  // get context value for ApiContext
  const value = useMemo<ApiContextProps>(
    () => ({
      api: (isRpcClientInitialized && settings && currentChain && currentSettings && {
        collection: new UniqueSDKCollectionController(currentChain.unique, {
          collectionIds: currentSettings.blockchain.unique.collectionIds
        }),
        nft: new UniqueSDKNFTController(currentChain.unique, {
          collectionIds: currentSettings.blockchain.unique.collectionIds,
          allowedTokens: currentSettings.blockchain.unique.allowedTokens
        }),
        market: new UniqueSDKMarketController(
          currentChain.unique,
          currentChain.kusama,
          {
            auctionAddress: currentSettings.auction.address,
            contractAddress: currentSettings.blockchain.unique.contractAddress,
            escrowAddress: currentSettings.blockchain.escrowAddress,
            wsEndpoint: currentSettings.blockchain.unique.wsEndpoint
          }
        )
      }) || undefined,
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
