import { BrowserProvider, JsonRpcSigner } from 'ethers'
import { useMemo } from 'react'
import type { Account, Chain, Client, Transport } from 'viem'
import { type Config, useConnectorClient } from 'wagmi';
import { useApi } from '../../hooks/useApi';
import { switchNetwork } from 'utils/swithChain';

export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  const provider = new BrowserProvider(transport, network)
  const signer = new JsonRpcSigner(provider, account.address)
  return signer;
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner() {
  const { currentChainId: chainId } = useApi();

  const numericChainId = getNumericChainId(chainId);
  switchNetwork(numericChainId);
  const { data: client } = useConnectorClient<Config>({ chainId: numericChainId });
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}

export function getNumericChainId(chainId: string | undefined): number {
  const chainIdMap: Record<string, number> = {
    unique: 8880,
    quartz: 8881,
    opal: 8882,
  };

  return chainId && chainId in chainIdMap ? chainIdMap[chainId] : 8880;
}