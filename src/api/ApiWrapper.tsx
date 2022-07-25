import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { keyring } from '@polkadot/ui-keyring';
import { ApiContextProps, ApiProvider } from './ApiContext';
import { getSettings } from './restApi/settings/settings';
import AuctionSocketProvider from './restApi/auction/AuctionSocketProvider';
import { Settings } from './restApi/settings/types';
import { SdkClient } from './sdk/sdkClient';
import { UniqueSDKNFTController } from './uniqueSdk/NFTController';
import { UniqueSDKCollectionController } from './uniqueSdk/collectionController';
import { UniqueSDKMarketController } from './uniqueSdk/marketController';
import { ChainProperties } from '@unique-nft/sdk/types';
import config from '../config';

import { uniqueSdkClient as unique, kusamaSdkClient as kusama } from '.';

keyring.loadAll({});

interface ChainProviderProps {
  children: React.ReactNode
  uniqueSdk?: SdkClient
  kusamaSdk?: SdkClient
}

const ApiWrapper = ({ children, uniqueSdk = unique, kusamaSdk = kusama }: ChainProviderProps) => {
  const [chainData, setChainData] = useState<ChainProperties>();
  const [isRpcClientInitialized, setRpcClientInitialized] = useState<boolean>(false);
  const { chainId } = useParams<'chainId'>();
  const [settings, setSettings] = useState<Settings>();

  useEffect(() => {
    (async () => {
      const { data: settings } = await getSettings();
      setSettings(settings);

      await uniqueSdk.connect(settings.blockchain.unique.wsEndpoint);
      await kusamaSdk.connect(settings.blockchain.kusama.wsEndpoint);

      console.log(uniqueSdk?.isReady && kusamaSdk?.isReady);

      setRpcClientInitialized(uniqueSdk?.isReady && kusamaSdk?.isReady);
      setChainData(uniqueSdk?.sdk?.chainProperties());
    })().then(() => console.log('Rpc connection: success')).catch((e) => console.log('Rpc connection: failed', e));
  }, []);

  // get context value for ApiContext
  const value = useMemo<ApiContextProps>(
    () => ({
      api: (isRpcClientInitialized && settings && uniqueSdk?.sdk && kusamaSdk.sdk && {
        collection: new UniqueSDKCollectionController(uniqueSdk.sdk, settings),
        nft: new UniqueSDKNFTController(uniqueSdk.sdk, settings),
        market: new UniqueSDKMarketController(uniqueSdk.sdk, kusamaSdk.sdk, settings)
      }) || undefined,
      uniqueSdk: uniqueSdk?.sdk,
      kusamaSdk: kusamaSdk?.sdk,
      chainData,
      settings
    }),
    [isRpcClientInitialized, chainId, chainData, settings]
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
