const configKeyRegexp = /NET_(?<network>[A-Z]+)_NAME$/gm;

export type Chain = {
  network: string;
  name: string;
  apiEndpoint: string;
}

const findNetworkParamByName = (
  config: Record<string, string | undefined>,
  network: string,
  name: string
): string => {
  const envKey = Object.keys(config).find((key) => key.includes(`NET_${network}_${name}`));

  if (envKey) return config[envKey] || '';

  return '';
};

export const getNetworkList = (config: Record<string, string | undefined>): string[] => {
  return Object.keys(config).reduce<string[]>((acc, key) => {
    if (!key.includes('NET_')) return acc;

    const { network } = configKeyRegexp.exec(key)?.groups || {};

    if (network) {
      acc.push(network);
    }

    return acc;
  }, []);
};

export const getNetworkParams = (
  config: Record<string, string | undefined>,
  network: string
): Chain => {
  const chain: Chain = {
    apiEndpoint: findNetworkParamByName(config, network, 'API'),
    name: findNetworkParamByName(config, network, 'NAME'),
    network
  };

  return chain;
};

export const getChainList = (config: Record<string, string | undefined>): Record<string, Chain> => {
  return getNetworkList(config).reduce<Record<string, Chain>>((acc, network) => {
    acc[network.toLowerCase()] = getNetworkParams(config, network);

    return acc;
  }, {});
};
