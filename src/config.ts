import { Chain } from './api/chainApi/types';
import { getChainList, getDefaultChain } from './utils/configParser';

declare type Env = {
  REACT_APP_IPFS_GATEWAY: string | undefined,
  REACT_APP_UNIQUE_API: string | undefined,
} & Record<string, string | undefined>

declare type Config = {
  uniqueApi: string | undefined
  IPFSGateway: string | undefined
  chains: Record<string, Chain>
  defaultChain: Chain
}

declare global {
  interface Window {
    ENV: Env
  }
}

const chains = getChainList(window.ENV || process.env);

const config: Config = {
  uniqueApi: window.ENV?.REACT_APP_UNIQUE_API || process.env.REACT_APP_UNIQUE_API,
  IPFSGateway: window.ENV?.REACT_APP_IPFS_GATEWAY || process.env.REACT_APP_IPFS_GATEWAY,
  chains,
  defaultChain: chains[getDefaultChain(window.ENV || process.env)]
};

export default config;
