
export interface ISDKCollectionController<Collection, Token> {
  getToken(collectionId: number, tokenId: number): Promise<Token | null>
  getAccountTokens(account: string): Promise<Token[]>
}
