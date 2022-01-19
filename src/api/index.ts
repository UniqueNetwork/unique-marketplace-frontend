import { getChainList, getDefaultChain } from '../utils/configParser'
import config from '../config'

export const chains = getChainList(config)
export const defaultChainId = getDefaultChain(config)
