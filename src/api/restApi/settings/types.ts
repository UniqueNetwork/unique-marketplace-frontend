import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';

export type AllowedCollection = {
  isCurated: boolean
  allowedTokens: string
  description: CollectionInfoWithSchemaResponse
}

export type AllowedCollections = {
  [key: string]: AllowedCollection
}

export type MarketContract = {
  address: string
  version: string
}

export type MarketContractAbiItem = {
  name: string
  stateMutability: 'payable'
  type: 'function'
}

export type Settings = {
  blockchain: {
    escrowAddress: string // TODO: can be removed (after it is removed from BE)
    unique: {
      rpcUrl: string,
      restUrl: string,
      collections: AllowedCollections,
      contracts: MarketContract[],
      contractsAbi?: Record<string, MarketContractAbiItem[]>
    }
  },
  auction: {
    commission: number,
    address: string
  },
  marketType: string,
  mainSaleSeedAddress: string,
  administrators: string[]
}

export type WhitelistBody = {
  account: string
}
