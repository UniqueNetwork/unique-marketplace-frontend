import { gql } from '@apollo/client';

const tokensQuery = gql`
query getTokens($limit: Int, $offset: Int, $where: tokens_bool_exp = {}) {
  tokens(where: $where, limit: $limit, offset: $offset) {
    id
    token_id
    collection_id
    data
    owner
    collection {
      name
    }
  }
  tokens_aggregate {
    aggregate {
      count
    }
  }
}
`;

interface Variables {
  limit: number;
  offset: number;
  where?: Record<string, any>;
}

interface Token {
  id: number
  token_id: number
  collection_id: number
  data: {
    hex: string
  },
  collection: {
    name: string,
  }
  owner: string
}

interface Data {
  tokens: Token[];
  tokens_aggregate: {
    aggregate: {
      count: number;
    }
  }
}

export type {
  Variables,
  Token,
  Data,
}
export {
  tokensQuery,
}