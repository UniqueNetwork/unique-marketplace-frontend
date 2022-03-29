import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IGqlClient } from './graphQL/gqlClient';
import { IRpcClient } from './chainApi/types';
import { ApiContextProps, ApiProvider, ChainData } from './ApiContext';
import config from '../config';
import { gqlClient as gql, rpcClient as rpc } from '.';
import { getSettings } from './restApi/settings/settings';
import { ApolloProvider } from '@apollo/client';
import AuctionSocketProvider from './restApi/auction/AuctionSocketProvider';
import { Settings } from './restApi/settings/types';

interface ChainProviderProps {
  children: React.ReactNode
  gqlClient?: IGqlClient
  rpcClient?: IRpcClient
}

const ApiWrapper = ({ children, gqlClient = gql, rpcClient = rpc }: ChainProviderProps) => {
  const [chainData, setChainData] = useState<ChainData>();
  const [isRpcClientInitialized, setRpcClientInitialized] = useState<boolean>(false);
  const { chainId } = useParams<'chainId'>();
  const [settings, setSettings] = useState<Settings>();

  useEffect(() => {
    (async () => {
      const { data: settings } = await getSettings();
      setSettings(settings);
      rpcClient?.setOnChainReadyListener(setChainData);
      await rpcClient?.initialize(settings);
      setRpcClientInitialized(true);
      setChainData(rpcClient?.chainData);
    })().then(() => console.log('Rpc connection: success')).catch((e) => console.log('Rpc connection: failed', e));
  }, []);

  // get context value for ApiContext
  const value = useMemo<ApiContextProps>(
    () => {
      return {
        api: (rpcClient && isRpcClientInitialized && {
          collection: rpcClient.collectionController,
          nft: rpcClient.nftController,
          market: rpcClient.marketController
        }) || undefined,
        chainData,
        rawRpcApi: rpcClient.rawUniqRpcApi,
        rpcClient,
        settings
      };
    },
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
