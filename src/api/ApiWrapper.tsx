import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChainPropertiesResponse } from '@unique-nft/sdk';
import { useNotifications } from 'components/UI';

import { ApiContextProps, ApiProvider, ICurrency } from './ApiContext';
import { MarketContract, Settings } from './restApi/settings/types';
import { NetworkOptions, SdkClient } from './sdk/sdkClient';
import config from '../config';
import { useSettings } from './restApi/settings/settings';
import { ChainIdLocalStorageKey, getInitialChainId } from '../utils/initialChainId';
import { filterTheLastContract } from 'utils/filterTheLastContract';

interface ChainProviderProps {
  children: React.ReactNode
  sdkClient?: SdkClient
}

const initialChainId = getInitialChainId();

const ApiWrapper = ({ children }: ChainProviderProps) => {
  const [sdkClient, setSdkClient] = useState<SdkClient>();
  const [isRpcClientInitialized, setRpcClientInitialized] = useState<boolean>(false);
  const [availableNetworkOptions, setAvailableNetworkOptions] = useState<NetworkOptions[]>();
  const [chainProperties, setChainProperties] = useState<ChainPropertiesResponse>();
  const [currentChainId, setCurrentChainId] = useState<string>(initialChainId);
  const [settings, setSettings] = useState<Settings>();
  //TO DO apdate after settings change
  const [currencies, setCurrencies] = useState<ICurrency[]>([
    {
      id: '0',
      collectionId: 0,
      title: 'OPL',
      iconUrl: '',
      decimals: 18,
      fee: 0
    },
  ]);
  const [lastContract, setLastContract] = useState<MarketContract | null>(null);

  const currencyMap = useMemo(() => {
    return new Map(currencies.map((currency) => [currency.id, currency]));
  }, [currencies]);

  const { fetchSettings } = useSettings();
  const { error } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const settings = await fetchSettings(config.blockchains);

      const networkOptions = settings.map<NetworkOptions>(({ networkId, settings }) => ({ networkId, settings }));
      setAvailableNetworkOptions(networkOptions);

      const currentNetworkOption = networkOptions.find((no) => no.networkId === currentChainId) || networkOptions[0];

      setSettings(currentNetworkOption.settings);
      const currencies =
        currentNetworkOption.settings.blockchain.unique.currencies.map(
          (currency) => ({
            ...currency,
            id: String(currency.collectionId),
            title: String(currency.collectionId)
          })
        );
      setCurrencies(currencies);
      setLastContract(filterTheLastContract(currentNetworkOption.settings.blockchain.unique.contracts));

      const sdkClient = new SdkClient(currentNetworkOption);
      setSdkClient(sdkClient);
      setChainProperties(await sdkClient.sdk.common.chainProperties());

      setRpcClientInitialized(true);
    })().then(() => {
      console.log('SDK connection: success');
    }).catch((e) => {
      error('SDK connection: failed', { name: 'warning', size: 16 });
      console.log('SDK connection: failed', e);
    });
  }, []);

  const refetchSettings = useCallback(async () => {
    const settings = await fetchSettings(config.blockchains);
    const networkOptions = settings.map<NetworkOptions>(({ networkId, settings }) => ({ networkId, settings }));
    setAvailableNetworkOptions(networkOptions);
    const currentNetworkOption = networkOptions.find((no) => no.networkId === currentChainId) || networkOptions[0];
    setSettings(currentNetworkOption.settings);
  }, [currentChainId, fetchSettings]);

  const onChangeChainId = useCallback(async (newChainId: string) => {
    if (currentChainId === newChainId) return;
    if (!sdkClient) {
      throw new Error('SdkClient is not available');
    }

    const option = availableNetworkOptions?.find((no) => no.networkId === newChainId);
    if (!option) throw new Error('Requested network not found'); // TODO: change to default one or atleast don't crash app

    setSettings(option.settings);

    sdkClient.setNetwork(option);
    setCurrentChainId(newChainId);
    setChainProperties(await sdkClient.sdk.common.chainProperties());
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
  }, [currentChainId, sdkClient, availableNetworkOptions, navigate]);

  // get current chain and current chain settings
  const currentChain = useMemo(() => {
    if (!sdkClient?.isReady || !currentChainId) return undefined;
    const option = availableNetworkOptions?.find((no) => no.networkId === currentChainId);
    return option;
  }, [currentChainId, sdkClient?.isReady]);

  // TODO: !!! GET CHAIN PREFIXES EITHER FROM BE OR CALCULATE VIA SDK !!! !!!!!!!!!!!!!!!!!!!!!!!!!!!!
  const prefixes = useMemo(() => {
    const prefixes = [255];
    if (chainProperties?.SS58Prefix) prefixes.push(chainProperties.SS58Prefix);
    return prefixes;
  },
    [chainProperties]
  );

  // get context value for ApiContext
  const value = useMemo<ApiContextProps>(
    () => ({
      api: (isRpcClientInitialized && settings && currentChain && sdkClient
        ? {
          collection: sdkClient.collectionController,
          nft: sdkClient.nftController,
          rft: sdkClient.rftController,
          market: sdkClient.marketController
        }
        : undefined),
      chainProperties,
      baseURL: config.blockchains[currentChainId]?.apiEndpoint || '',
      featuredCollections: settings?.blockchain.unique.collections || {},
      refetchSettings,
      settings,
      prefixes,
      currentChainId,
      onChangeChainId,
      currencies,
      setCurrencies,
      currencyMap,
      lastContract,
    }),
    [isRpcClientInitialized, currentChain, settings, currentChainId, prefixes, onChangeChainId, refetchSettings, chainProperties, sdkClient, currencies, currencyMap, lastContract, setCurrencies]
  );

  return (
    <ApiProvider value={value}>
      {children}
    </ApiProvider>
  );
};

export default ApiWrapper;
