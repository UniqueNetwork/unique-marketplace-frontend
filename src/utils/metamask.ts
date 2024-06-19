import { AddEthereumChainParameter } from '@unique-nft/utils/extension';

export const changeMetamaskChain = async (EthereumChainParams: AddEthereumChainParameter) => {
  // @ts-ignore
  const metamaskProvider = window.ethereum;
  if (!(await metamaskProvider?.isConnected())) return;

  const currentChainId = await metamaskProvider.request({ method: 'eth_chainId' });
  const newChainId = EthereumChainParams.chainId;

  if (String(currentChainId) === newChainId) return;

  try {
    await metamaskProvider?.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: newChainId }]
    });
  } catch {
    await metamaskProvider?.request({
      method: 'wallet_addEthereumChain',
      params: [EthereumChainParams]
    });
  }
};
