import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IGqlClient } from './graphQL/gqlClient';
import { IRpcClient } from './chainApi/types';
import { ApiContextProps, ApiProvider, ChainData } from './ApiContext';
import config from '../config';
import { defaultChainKey } from '../utils/configParser';
import { gqlClient as gql, rpcClient as rpc } from '.';
import { getSettings, useSettings } from './restApi/settings/settings';
import { ApolloProvider } from '@apollo/client';

interface ChainProviderProps {
  children: React.ReactNode
  gqlClient?: IGqlClient
  rpcClient?: IRpcClient
}

const { chains, defaultChain } = config;

const ApiWrapper = ({ children, gqlClient = gql, rpcClient = rpc }: ChainProviderProps) => {
  const [chainData, setChainData] = useState<ChainData>();
  const [isRpcClientInitialized, setRpcClientInitialized] = useState<boolean>(false);
  const { chainId } = useParams<'chainId'>();

  useEffect(() => {
    (async () => {
      const { data: settings } = await getSettings();

      await rpcClient?.initialize(settings);

      rpcClient?.setOnChainReadyListener(setChainData);
      setRpcClientInitialized(true);
    })().then(console.log).catch(console.log);
  }, []);

  // update endpoint if chainId is changed
  useEffect(() => {
    if (Object.values(chains).length === 0) {
      throw new Error('Networks is not configured');
    }

    if (chainId) {
      const currentChain = chainId ? chains[chainId] : defaultChain;
      // TODO: change endpoint in axios instance, then obtain settings from rest api and change endpoint in rpcClient
      // rpcClient.changeEndpoint(currentChain.rpcEndpoint);
      // TODO: remove it
      // gqlClient.changeEndpoint(currentChain.gqlEndpoint);

      // set current chain id into localStorage
      localStorage.setItem(defaultChainKey, chainId);
    }
  }, [chainId]);

  // get context value for ApiContext
  const value = useMemo<ApiContextProps>(
    () => {
      return {
        api: (rpcClient && rpc.isApiConnected && {
          collection: rpcClient.collectionController,
          nft: rpcClient.nftController,
          market: rpcClient.marketController
        }) || undefined,
        chainData,
        currentChain: chainId ? chains[chainId] : defaultChain,
        rawRpcApi: rpcClient.rawRpcApi,
        rpcClient
      };
    },
    [isRpcClientInitialized, chainId, chainData]
  );

  return (
    <ApiProvider value={value}>
      <ApolloProvider client={gqlClient.client}>{children}</ApolloProvider>
    </ApiProvider>
  );
};

export default ApiWrapper;
