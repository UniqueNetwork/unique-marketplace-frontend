import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { keyring } from '@polkadot/ui-keyring';
import { ApiContextProps, ApiProvider } from './ApiContext';
import { getSettings } from './restApi/settings/settings';
import AuctionSocketProvider from './restApi/auction/AuctionSocketProvider';
import { Settings } from './restApi/settings/types';
import config from '../config';
import { SDKFactory } from './sdk/sdk';
import { Sdk } from '@unique-nft/sdk';
import { UniqueSDKNFTController } from './uniqueSdk/NFTController';
import { UniqueSDKCollectionController } from './uniqueSdk/collectionController';
import { UniqueSDKMarketController } from './uniqueSdk/marketController';
import { ChainProperties } from '@unique-nft/sdk/types';

import { rpcClient as rpc } from '.';
import { IRpcClient } from './chainApi/types';

keyring.loadAll({});

interface ChainProviderProps {
  children: React.ReactNode
  rpcClient?: IRpcClient
}

const ApiWrapper = ({ children, rpcClient = rpc }: ChainProviderProps) => {
  const [chainData, setChainData] = useState<ChainProperties>();
  const [isRpcClientInitialized, setRpcClientInitialized] = useState<boolean>(false);
  const { chainId } = useParams<'chainId'>();
  const [settings, setSettings] = useState<Settings>();
  const uniqueSdkRef = useRef<Sdk>();
  const kusamaSdkRef = useRef<Sdk>();

  useEffect(() => {
    (async () => {
      const { data: settings } = await getSettings();
      setSettings(settings);
      uniqueSdkRef.current = await SDKFactory(settings.blockchain.unique.wsEndpoint);
      kusamaSdkRef.current = await SDKFactory(settings.blockchain.kusama.wsEndpoint);

      await rpcClient?.initialize(settings);
      setRpcClientInitialized(true);
      setChainData(uniqueSdkRef.current?.chainProperties());
    })().then(() => console.log('Rpc connection: success')).catch((e) => console.log('Rpc connection: failed', e));
  }, []);

  // get context value for ApiContext
  const value = useMemo<ApiContextProps>(
    () => ({
      api: (uniqueSdkRef.current && kusamaSdkRef.current && settings && isRpcClientInitialized && {
        collection: new UniqueSDKCollectionController(uniqueSdkRef.current, settings), // rpcClient.collectionController,
        nft: new UniqueSDKNFTController(uniqueSdkRef.current, settings), // rpcClient.nftController,
        market: new UniqueSDKMarketController(uniqueSdkRef.current, kusamaSdkRef.current, settings) // rpcClient.marketController
      }) || undefined,
      uniqueSdk: uniqueSdkRef.current,
      chainData,
      rawRpcApi: rpcClient.rawUniqRpcApi,
      rawKusamaRpcApi: rpcClient.rawKusamaRpcApi,
      rawKusamaSdk: kusamaSdkRef.current,
      rpcClient,
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
