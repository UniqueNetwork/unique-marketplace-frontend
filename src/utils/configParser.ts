import { Chain } from '../chains'
import config from '../config'

const configKeyRegexp = /NET_(?<network>[A-Z]+)_NAME$/gm

const findNetworkParamByName = (network: string, name: string): string => {
  const envKey = Object.keys(config).find((key) => key.includes(`NET_${network}_${name}`))
  if (envKey) return config[envKey] || ''
  return ''
}

export const getNetworkList = (): string[] => {
  return Object.keys(config).reduce<string[]>((acc, key) => {
    if (!key.includes('NET_')) return acc

    const { network } = configKeyRegexp.exec(key)?.groups || {}

    if (network) {
      acc.push(network)
    }

    return acc
  }, [])
}

export const getNetworkParams = (network: string): Chain => {
  const chain: Chain = {
    network,
    name: findNetworkParamByName(network, `NAME`),
    clientEndpoint: findNetworkParamByName(network, 'API'),
    rpcEndpoint: findNetworkParamByName(network, 'RPC'),
  }
  return chain
}

export const getChainList = (): Record<string, Chain> => {
  return getNetworkList().reduce<Record<string, Chain>>((acc, network) => {
    acc[network] = getNetworkParams(network)
    return acc
  }, {})
}
