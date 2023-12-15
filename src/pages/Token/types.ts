export type CollectionItem = {
  collectionId: number
  collectionName: string
  collectionCover: string
  collectionOwner: string
}

export type TokenItem = {
  tokenId: number
  tokenName: string
  tokenPrefix: string
  collectionId: number
  parent?: string
  image: {
    fullUrl?: string | null;
    ipfsCid?: string | null;
  }
  nested: boolean
};

export type NestedTokenItem = {
  burned: boolean
  childrenCount: number
  collectionId: number
  image: {
    fullUrl?: string | null;
    ipfsCid?: string | null;
  }
  owner: string
  parentId: string
  tokenId: number
  tokenName: string
  tokenPrefix: string
  nestingChildren: NestedTokenItem[]
}
