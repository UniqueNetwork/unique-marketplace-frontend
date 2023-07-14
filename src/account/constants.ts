import { AddEthereumChainParameter, Ethereum } from '@unique-nft/utils/extension';

export const EthereumChainParams: Record<string, AddEthereumChainParameter> = {
  unique: Ethereum.UNIQUE_CHAINS_DATA_FOR_EXTENSIONS.unique,
  quartz: Ethereum.UNIQUE_CHAINS_DATA_FOR_EXTENSIONS.quartz,
  opal: Ethereum.UNIQUE_CHAINS_DATA_FOR_EXTENSIONS.opal,
  sapphire: Ethereum.UNIQUE_CHAINS_DATA_FOR_EXTENSIONS.sapphire
};
