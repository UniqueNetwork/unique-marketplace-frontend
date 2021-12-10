import { gql } from '@apollo/client';

const lastTransfersQuery = gql`
query getLastTransfers($limit: Int, $offset: Int) {
  view_last_transfers(limit: $limit, offset: $offset, order_by: {block_index: desc}) {
    block_index
    from_owner
    to_owner
  }
  
  view_last_transfers_aggregate {
    aggregate {
      count
    }
  }
}
`;

interface Variables {
  limit: number;
  offset: number;
}

interface Transfer {
  block_index: string;
  from_owner: string;
  to_owner: string;
}

interface Data {
  view_last_transfers: Transfer[];
  view_last_transfers_aggregate: {
    aggregate: {
      count: number;
    }
  }
}

export type {
  Variables,
  Transfer,
  Data,
}
export {
  lastTransfersQuery,
}