import { AddEthereumChainParameter } from '@unique-nft/utils/extension';

export const changeMetamaskChain = async (EthereumChainParams: AddEthereumChainParameter) => {
  // @ts-ignore
  const metamaskProvider = window.ethereum;
  if (!(await metamaskProvider?.isConnected())) return;

  const currentChainId = await metamaskProvider.request({ method: 'eth_chainId' });

  if (String(currentChainId) === EthereumChainParams.chainId) return;

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
