import { Chain } from '../api/chainApi/types'

const configKeyRegexp = /NET_(?<network>[A-Z]+)_NAME$/gm

export const defaultChainKey = 'block-explorer_chain'

const findNetworkParamByName = (
  config: Record<string, string | undefined>,
  network: string,
  name: string
): string => {
  const envKey = Object.keys(config).find((key) => key.includes(`NET_${network}_${name}`))
  if (envKey) return config[envKey] || ''
  return ''
}

export const getNetworkList = (config: Record<string, string | undefined>): string[] => {
  return Object.keys(config).reduce<string[]>((acc, key) => {
    if (!key.includes('NET_')) return acc

    const { network } = configKeyRegexp.exec(key)?.groups || {}

    if (network) {
      acc.push(network)
    }

    return acc
  }, [])
}

export const getDefaultChain = (config: Record<string, string | undefined>) => {
  return localStorage.getItem(defaultChainKey) || getNetworkList(config)[0]
}

export const getNetworkParams = (
  config: Record<string, string | undefined>,
  network: string
): Chain => {
  const chain: Chain = {
    network,
    name: findNetworkParamByName(config, network, `NAME`),
    gqlEndpoint: findNetworkParamByName(config, network, 'API'),
    rpcEndpoint: findNetworkParamByName(config, network, 'RPC'),
  }
  return chain
}

export const getChainList = (config: Record<string, string | undefined>): Record<string, Chain> => {
  return getNetworkList(config).reduce<Record<string, Chain>>((acc, network) => {
    acc[network] = getNetworkParams(config, network)
    return acc
  }, {})
}
