import { gql } from '@apollo/client'

const collectionsQuery = gql`
  query getCollections($limit: Int, $offset: Int, $where: collections_bool_exp = {}) {
    collections(where: $where, limit: $limit, offset: $offset) {
      collection_id
      description
      name
      owner
      token_prefix
      tokens_aggregate {
        aggregate {
          count
        }
      }
    }
    collections_aggregate {
      aggregate {
        count
      }
    }
  }
`

interface Variables {
  limit: number
  offset: number
  where?: Record<string, any>
}

interface Collection {
  collection_id: number
  description: string
  name: string
  owner: string
  token_prefix: string
  tokens_aggregate: {
    aggregate: {
      count: number
    }
  }
}

interface Data {
  collections: Collection[]
  collections_aggregate: {
    aggregate: {
      count: number
    }
  }
}

export type { Variables, Collection, Data }
export { collectionsQuery }
