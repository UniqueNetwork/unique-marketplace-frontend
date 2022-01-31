export interface TokensVariables {
  limit: number
  offset: number
  where?: Record<string, unknown>
}

export interface Token {
  id: number
  token_id: number
  collection_id: number
  data: {
    hex: string
  }
  token_prefix: string
  collection_name: string
  image_path: string
  owner: string
}

export interface TokensData {
  view_tokens: Token[]
  view_tokens_aggregate: {
    aggregate: {
      count: number
    }
  }
}

export enum TokenStatus {
  ownedByMe = 'My tokens', // used for "My stuff" page
  myOnSell = 'My NFTs on sell',
  fixedPrice = 'Fixed price',
  timedAuction = 'Timed auction',
  myBets = 'My bets'
}

export interface PriceFilter {
  min: number | undefined,
  max: number | undefined
}
export interface TokensFilter {
  status: TokenStatus[],
  price: PriceFilter,
  collections: number[] | undefined,
  search: string | undefined,
}

export type useGraphQlTokensProps = {
  pageSize: number
  filter?: TokensFilter
}

export type FetchMoreTokensOptions = {
  filter?: TokensFilter
  limit?: number
  offset?: number
  orderDir?: ['asc', 'dsc']
}
