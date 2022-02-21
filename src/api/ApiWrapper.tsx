import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { IGqlClient } from './graphQL/gqlClient';
import { IRpcClient } from './chainApi/types';
import { ApiContextProps, ApiProvider, ChainData } from './ApiContext';
import config from '../config';
import { defaultChainKey } from '../utils/configParser';
import { gqlClient as gql, rpcClient as rpc } from '.';

interface ChainProviderProps {
  children: React.ReactNode
  gqlClient?: IGqlClient
  rpcClient?: IRpcClient
}

const { chains, defaultChain } = config;

const ApiWrapper = ({ children, gqlClient = gql, rpcClient = rpc }: ChainProviderProps) => {
  const [chainData, setChainData] = useState<ChainData>();
  const { chainId } = useParams<'chainId'>();

  useEffect(() => {
    rpcClient?.setOnChainReadyListener(setChainData);
  }, []);

  // update endpoint if chainId is changed
  useEffect(() => {
    if (Object.values(chains).length === 0) {
      throw new Error('Networks is not configured');
    }

    if (chainId) {
      const currentChain = chainId ? chains[chainId] : defaultChain;

      rpcClient.changeEndpoint(currentChain.rpcEndpoint);
      gqlClient.changeEndpoint(currentChain.gqlEndpoint);

      // set current chain id into localStorage
      localStorage.setItem(defaultChainKey, chainId);
    }
  }, [chainId]);

  // get context value for ApiContext
  const value = useMemo<ApiContextProps>(
    () => ({
      api: (rpcClient && rpc.isApiConnected && {
        collection: rpcClient.collectionController,
        nft: rpcClient.nftController
      }) || undefined,
      chainData,
      currentChain: chainId ? chains[chainId] : defaultChain,
      rawRpcApi: rpcClient.rawRpcApi,
      rpcClient
    }),
    [rpcClient, chainId, chainData]
  );

  return (
    <ApiProvider value={value}>
      <ApolloProvider client={gqlClient.client}>{children}</ApolloProvider>
    </ApiProvider>
  );
};

export default ApiWrapper;
