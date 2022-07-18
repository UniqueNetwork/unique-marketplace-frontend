import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { IGqlClient } from './graphQL/gqlClient';
import { IRpcClient } from './chainApi/types';
import { ApiContextProps, ApiProvider, ChainData } from './ApiContext';
import { gqlClient as gql, rpcClient as rpc } from '.';
import { getSettings } from './restApi/settings/settings';
import { ApolloProvider } from '@apollo/client';
import AuctionSocketProvider from './restApi/auction/AuctionSocketProvider';
import { Settings } from './restApi/settings/types';
import config from '../config';
// import { SdkClient } from './uniqueSdk/sdkClient';
import { SDKFactory } from './sdk/sdk';
import { Sdk } from '@unique-nft/sdk';
import { UniqueSDKNFTController } from './uniqueSdk/NFTController';
import { UniqueSDKCollectionController } from './uniqueSdk/collectionController';

interface ChainProviderProps {
  children: React.ReactNode
  // sdkClient?: SdkClient
  gqlClient?: IGqlClient
  rpcClient?: IRpcClient
}

const ApiWrapper = ({ children, gqlClient = gql, rpcClient = rpc }: ChainProviderProps) => {
  const [chainData, setChainData] = useState<ChainData>();
  const [isRpcClientInitialized, setRpcClientInitialized] = useState<boolean>(false);
  const { chainId } = useParams<'chainId'>();
  const [settings, setSettings] = useState<Settings>();
  const sdkRef = useRef<Sdk>();

  useEffect(() => {
    (async () => {
      const { data: settings } = await getSettings();
      setSettings(settings);
      sdkRef.current = await SDKFactory(settings);

      rpcClient?.setOnChainReadyListener(setChainData);
      await rpcClient?.initialize(settings);
      setRpcClientInitialized(true);
      setChainData(rpcClient?.chainData);
    })().then(() => console.log('Rpc connection: success')).catch((e) => console.log('Rpc connection: failed', e));
  }, []);

  // get context value for ApiContext
  const value = useMemo<ApiContextProps>(
    () => ({
      // try pro SDK
      sdk: sdkRef.current,
      api: (sdkRef.current && settings && isRpcClientInitialized && {
        collection: new UniqueSDKCollectionController(sdkRef.current, settings), // rpcClient.collectionController,
        nft: new UniqueSDKNFTController(sdkRef.current, settings), // rpcClient.nftController,
        market: rpcClient.marketController
      }) || undefined,
      chainData,
      rawRpcApi: rpcClient.rawUniqRpcApi,
      rawKusamaRpcApi: rpcClient.rawKusamaRpcApi,
      rpcClient,
      settings
    }),
    [isRpcClientInitialized, chainId, chainData, settings]
  );

  return (
    <ApiProvider value={value}>
      <AuctionSocketProvider url={config.uniqueApiUrl}>
        <ApolloProvider client={gqlClient.client}>{children}</ApolloProvider>
      </AuctionSocketProvider>
    </ApiProvider>
  );
};

export default ApiWrapper;
