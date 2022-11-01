import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { keyring } from '@polkadot/ui-keyring';
import { useNotifications } from 'components/UI';
import { ApiContextProps, ApiProvider } from './ApiContext';
import AuctionSocketProvider from './restApi/auction/AuctionSocketProvider';
import { Settings } from './restApi/settings/types';
import { SdkClient } from './sdk/sdkClient';
import config from '../config';
import { sdkClient as sdk } from '.';
import { useSettings } from './restApi/settings/settings';
import { ChainIdLocalStorageKey, getInitialChainId } from '../utils/initialChainId';
import { GqlClient } from './graphQL/gqlClient';
import { ApolloProvider } from '@apollo/client';

keyring.loadAll({});

interface ChainProviderProps {
  children: React.ReactNode
  sdkClient?: SdkClient
  gqlClient?: GqlClient
}

const initialChainId = getInitialChainId();

const ApiWrapper = ({
  children,
  sdkClient = sdk,
  gqlClient = new GqlClient(config.blockchains[initialChainId].scanApi)
}: ChainProviderProps) => {
  const [isRpcClientInitialized, setRpcClientInitialized] = useState<boolean>(false);
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>();
  const [currentChainId, setCurrentChainId] = useState<string>(initialChainId);
  const { error } = useNotifications();
  const { fetchSettings } = useSettings();

  useEffect(() => {
    (async () => {
      const settings = await fetchSettings(config.blockchains);

      await sdk.initialize(settings);

      setSettings(sdkClient?.networks[currentChainId].settings);
      sdkClient?.setNetwork(currentChainId);

      setRpcClientInitialized(sdkClient?.isReady);
    })().then(() => {
      console.log('Rpc connection: success');
    }).catch((e) => {
      error('Rpc connection: failed', { name: 'warning', size: 16 });
      console.log('Rpc connection: failed', e);
    });
  }, []);

  const onChangeChainId = useCallback((newChainId: string) => {
    if (currentChainId === newChainId) return;
    if (!sdkClient) {
      throw new Error('SdkClient is not available');
    }

    const { settings } = sdkClient.networks[newChainId];

    setSettings(settings);

    sdkClient?.setNetwork(newChainId);
    gqlClient?.changeEndpoint(config.blockchains[newChainId].scanApi);
    setCurrentChainId(newChainId);
    localStorage.setItem(ChainIdLocalStorageKey, newChainId);
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

    return sdkClient?.networks[currentChainId].sdkSet;
  }, [currentChainId, sdkClient?.isReady]);

  // get context value for ApiContext
  const value = useMemo<ApiContextProps>(
    () => ({
      api: (isRpcClientInitialized && settings && currentChain && sdkClient
        ? {
          collection: sdkClient.collectionController,
          nft: sdkClient.nftController,
          market: sdkClient.marketController
        }
        : undefined),
      gqlClient,
      uniqueSdk: currentChain?.unique,
      kusamaSdk: currentChain?.kusama,
      chainData: currentChain?.unique.chainProperties(),
      baseURL: config.blockchains[currentChainId]?.apiEndpoint || '',
      settings,
      currentChainId,
      onChangeChainId
    }),
    [isRpcClientInitialized, currentChain, settings, currentChainId, gqlClient]
  );

  return (
    <ApiProvider value={value}>
      <ApolloProvider client={gqlClient?.client}>
        <AuctionSocketProvider url={config.blockchains[currentChainId]?.apiEndpoint}>
          {children}
        </AuctionSocketProvider>
      </ApolloProvider>
    </ApiProvider>
  );
};

export default ApiWrapper;
