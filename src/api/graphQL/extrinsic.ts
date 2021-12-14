import { gql } from '@apollo/client';

const extrinsicQuery = gql`
query getExtrinsic($block_index: String!) {
  view_extrinsic(where: {block_index: {_eq: $block_index}}) {
    amount
    args
    block_index
    block_number
    fee
    hash
    method
    section
    signer
    success
    timestamp
  }
}
`;

interface Variables {
  block_index: string;
}

interface Extrinsic {
  amount: number;
  args: string;
  block_index: string;
  block_number: number;
  fee: number;
  hash: string;
  method: string;
  section: string;
  signer: string;
  success: boolean;
  timestamp: number;
  from_owner: string;
  to_owner: string;
}

interface Data {
  view_extrinsic: Extrinsic[];
}

export type {
  Variables,
  Data,
}
export {
  extrinsicQuery,
}