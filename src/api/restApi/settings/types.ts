
export type ChainSettings = {
  chainName: string,
  blockchain: {
    escrowAddress: string
    unique: {
      wsEndpoint: string
      collectionIds: number[]
      contractAddress: string
      allowedTokens: { collection: number, tokens: string }[]
    },
    kusama: {
      wsEndpoint: string
      marketCommission: string
    },
  },
  auction: {
    commission: number,
    address: string
  }
}

export type Settings = {
  blockchains: {
    [K: string]: ChainSettings
  },
  marketType: string,
  mainSaleSeedAddress: string,
  administrators: string[]
}

export type WhitelistBody = {
  account: string
}
