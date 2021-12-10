import { gql } from '@apollo/client';

const collectionsQuery = gql`
query getCollections($owner: String, $limit: Int, $offset: Int) {
  collections(where: {owner: {_eq: $owner}}, limit: $limit, offset: $offset) {
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
}
`;

interface Variables {
  owner?: string | undefined | null;
  limit: number;
  offset: number;
}

interface Collection {
  "collection_id": number;
  "description": string;
  "name": string;
  "owner": string;
  "token_prefix": string;
  "tokens_aggregate": {
    "aggregate": {
      "count": number
    }
  }
}

interface Data {
  "collections": Collection[];
}

export type {
  Variables,
  Collection,
  Data,
}
export {
  collectionsQuery,
}