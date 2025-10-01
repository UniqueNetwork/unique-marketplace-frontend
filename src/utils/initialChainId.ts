import config from '../config';

export const ChainIdLocalStorageKey = 'unique_market_chain_id';

export const getInitialChainId = (): string => {
  const blockchainKeys = Object.keys(config?.blockchains || {});
  const defaultChainId = blockchainKeys.reverse()[0];

  const getStoredChainId = () => {
    const chainId = localStorage.getItem(ChainIdLocalStorageKey);
    return chainId && config?.blockchains[chainId] ? chainId : undefined;
  };

  let storedChainId = getStoredChainId();
  const chainIdParam = new RegExp(blockchainKeys.join('|')).exec(location.pathname)?.[0] || '';

  if (!chainIdParam) {
    if (config.blockchains['unique']) {
      if (storedChainId !== 'unique') {
        storedChainId = 'unique';
        localStorage.setItem(ChainIdLocalStorageKey, 'unique');
      }
    } else {
      if (storedChainId !== defaultChainId) {
        storedChainId = defaultChainId;
        localStorage.setItem(ChainIdLocalStorageKey, defaultChainId);
      }
    }
  } else if (!storedChainId || storedChainId !== chainIdParam) {
    storedChainId = chainIdParam;
    localStorage.setItem(ChainIdLocalStorageKey, chainIdParam);
  }

  return chainIdParam || storedChainId || defaultChainId;
};
