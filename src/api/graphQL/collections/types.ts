export interface Collection {
  collection_id: number
  description: string
  name: string
  owner: string
  token_prefix: string
  offchain_schema: string
  schema_version: string
  tokens_aggregate: {
    aggregate: {
      count: number
    }
  }
}

export interface CollectionsVariables {
  limit: number
  offset: number
  where?: Record<string, any>
}

export interface CollectionsData {
  collections: Collection[]
  collections_aggregate: {
    aggregate: {
      count: number
    }
  }
}

export type useGraphQlCollectionsProps = {
  pageSize: number
  filter?: Record<string, any>
}

export type FetchMoreCollectionsOptions = {
  limit?: number
  offset?: number
  searchString?: string
}
