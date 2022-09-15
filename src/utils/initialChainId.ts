import config from '../config';

export const ChainIdLocalStorageKey = 'unique_market_chain_id';

export const getInitialChainId = (): string => {
  const defaultChainId = Object.keys(config?.blockchains || {})[0];

  const getStoredChainId = () => {
    const chainId = localStorage.getItem(ChainIdLocalStorageKey);
    return chainId && config?.blockchains[chainId] ? chainId : undefined;
  };

  const storedChainId = getStoredChainId();

  const chainIdParam = new RegExp(Object.keys(config.blockchains).join('|')).exec(location.pathname)?.[0] || '';

  if (!storedChainId || (chainIdParam && storedChainId !== chainIdParam)) {
    defaultChainId && localStorage.setItem(ChainIdLocalStorageKey, chainIdParam || defaultChainId);
  }

  return chainIdParam || storedChainId || defaultChainId;
};
