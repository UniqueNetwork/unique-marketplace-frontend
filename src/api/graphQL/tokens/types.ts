export interface TokensVariables {
  limit: number
  offset: number
  where?: Record<string, any>
}

export interface Token {
  id: number
  token_id: number
  collection_id: number
  data: {
    hex: string
  }
  collection: {
    name: string
    token_prefix: string
  }
  owner: string
}

export interface TokensData {
  tokens: Token[]
  tokens_aggregate: {
    aggregate: {
      count: number
    }
  }
}

export type useGraphQlTokensProps = {
  pageSize: number
  filter?: Record<string, any>
}

export type FetchMoreTokensOptions = {
  limit?: number
  offset?: number
  searchString?: string
}
