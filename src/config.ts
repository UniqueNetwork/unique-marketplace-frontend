import { Chain } from './api/chainApi/types';
import { getChainList, getDefaultChain } from './utils/configParser';

declare type Env = {
  REACT_APP_IPFS_GATEWAY: string | undefined,
  REACT_APP_UNIQUE_API_URL: string | undefined,
} & Record<string, string | undefined>

declare type Config = {
  contractAddress: string | undefined,
  uniqueSubstrateApiRpc: string | undefined,
  minPrice: number | undefined,
  escrowAddress: string | undefined,
  uniqueApiUrl: string | undefined
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
  contractAddress: window.ENV?.CONTRACT_ADDRESS || process.env.CONTRACT_ADDRESS,
  uniqueSubstrateApiRpc: window.ENV?.UNIQUE_SUBSTRATE_API_RPC || process.env.UNIQUE_SUBSTRATE_API_RPC,
  minPrice: +window.ENV?.MIN_PRICE || process.env.MIN_PRICE,
  escrowAddress: window.ENV?.ESCROW_ADDRESS || process.env.ESCROW_ADDRESS,
  uniqueApiUrl: window.ENV?.REACT_APP_UNIQUE_API_URL || process.env.REACT_APP_UNIQUE_API_URL,
  IPFSGateway: window.ENV?.REACT_APP_IPFS_GATEWAY || process.env.REACT_APP_IPFS_GATEWAY,
  chains,
  defaultChain: chains[getDefaultChain(window.ENV || process.env)]
};

export default config;
