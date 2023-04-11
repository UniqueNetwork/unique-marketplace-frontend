export type AllowedCollection = {
  allowedTokens: string
}

export type AllowedCollections = {
  [key: string]: AllowedCollection
}

export type Settings = {
  blockchain: {
    escrowAddress: string // TODO: can be removed (after it is removed from BE)
    unique: {
      rpcUrl: string,
      restUrl: string,
      collections: AllowedCollections,
      contracts: {
        address: string
      }[]
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
