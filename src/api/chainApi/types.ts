import { ApiPromise } from '@polkadot/api'

export interface IRpcClient {
  api?: ApiPromise
  chainData: any
}

export interface IRpcStrategy<Collection, Token> {
  api: ApiPromise
  setApi(api: ApiPromise): void
  getCollection(collectionId: string): Promise<Collection | null>
  getTokensOfCollection(collectionId: string, ownerId: string): Promise<Token[]>
  getToken(collection: Collection, tokenId: string): Promise<Token | null>
}

