import { AddEthereumChainParameter } from '@unique-nft/utils/extension';

export const changeMetamaskChain = async (EthereumChainParams: AddEthereumChainParameter) => {
  // @ts-ignore
  const metamaskProvider = window.ethereum;
  if (!(await metamaskProvider?.isConnected())) return;

  try {
    await metamaskProvider?.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: EthereumChainParams.chainId }]
    });
  } catch {
    await metamaskProvider?.request({
      method: 'wallet_addEthereumChain',
      params: [EthereumChainParams]
    });
  }
};
