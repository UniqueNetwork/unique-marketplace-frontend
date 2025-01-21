import { Config, switchChain } from '@wagmi/core';
import { createWeb3ModalConfig } from 'account/WalletConnectContext/Web3ModalConfig';
import { unique } from "viem/chains";
import { useConfig } from 'wagmi';

export const switchNetwork = async (chainId: number, config: Config) => {
  //console.log('SWITCH_CHAIN', chainId, config)
  await switchChain(config, { chainId });
};