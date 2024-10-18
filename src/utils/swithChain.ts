import { switchChain } from '@wagmi/core';
import { config } from "../account/WalletConnectContext/WalletConnectProviders";

export const switchNetwork = async (chainId: number) => {
  await switchChain(config, { chainId });
};