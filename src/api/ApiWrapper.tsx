import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { keyring } from '@polkadot/ui-keyring';
import { useNotifications } from 'components/UI';
import { ApiContextProps, ApiProvider } from './ApiContext';
import AuctionSocketProvider from './restApi/auction/AuctionSocketProvider';
import { Settings } from './restApi/settings/types';
import { NetworkOptions, SdkClient } from './sdk/sdkClient';
import config from '../config';
import { useSettings } from './restApi/settings/settings';
import { ChainIdLocalStorageKey, getInitialChainId } from '../utils/initialChainId';
import { Sdk } from '@unique-nft/sdk';

keyring.loadAll({});

interface ChainProviderProps {
  children: React.ReactNode
  sdkClient?: SdkClient
}

const initialChainId = getInitialChainId();

const ApiWrapper = ({ children }: ChainProviderProps) => {
  const [sdkClient, setSdkClient] = useState<SdkClient>();
  const [isRpcClientInitialized, setRpcClientInitialized] = useState<boolean>(false);
  const navigate = useNavigate();
  const [availableNetworkOptions, setAvailableNetworkOptions] = useState<NetworkOptions[]>();
  const [settings, setSettings] = useState<Settings>();
  const [currentChainId, setCurrentChainId] = useState<string>(initialChainId);
  const { error } = useNotifications();
  const { fetchSettings } = useSettings();

  useEffect(() => {
    (async () => {
      const settings = await fetchSettings(config.blockchains);
      // TODO: save network options here instead of sdkClient and simply call sdkClient.setNetwork(those options)
      const networkOptions = settings.map<NetworkOptions>(({ networkId, sdkEndpoint, sdkRelayEndpoint, settings }) => ({ networkId, sdkEndpoint, sdkRelayEndpoint, settings }));
      setAvailableNetworkOptions(networkOptions);
      const defaultNetworkOption = networkOptions[0]; // aka currentOption
      setSettings(defaultNetworkOption.settings);

      setSdkClient(new SdkClient(defaultNetworkOption));

      setRpcClientInitialized(true);
    })().then(() => {
      console.log('SDK connection: success');
    }).catch((e) => {
      error('SDK connection: failed', { name: 'warning', size: 16 });
      console.log('SDK connection: failed', e);
    });
  }, []);

  const onChangeChainId = useCallback(async (newChainId: string) => {
    if (currentChainId === newChainId) return;
    if (!sdkClient) {
      throw new Error('SdkClient is not available');
    }

    const option = availableNetworkOptions?.find((no) => no.networkId === newChainId);
    if (!option) throw new Error('Requested network not found'); // TODO: change to default one or atleast don't crash app

    setSettings(option.settings);

    await sdkClient?.setNetwork(option);
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
    const option = availableNetworkOptions?.find((no) => no.networkId === currentChainId);
    return option;
  }, [currentChainId, sdkClient?.isReady]);

  // TODO: !!! GET CHAIN PREFIXES EITHER FROM BE OR CALCULATE VIA SDK !!! !!!!!!!!!!!!!!!!!!!!!!!!!!!!
  const prefixes = useMemo(() => Object.values(availableNetworkOptions || []).map(() => 255),
    [isRpcClientInitialized]
  );

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
      // chainData: currentChain?.uniqueProperties, // TODO: chain properties are required
      baseURL: config.blockchains[currentChainId]?.apiEndpoint || '',
      settings,
      prefixes,
      currentChainId,
      onChangeChainId
    }),
    [isRpcClientInitialized, currentChain, settings, currentChainId, prefixes]
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
