import { gql } from '@apollo/client';

const extrinsicQuery = gql`
query getLastTransfers($block_number: String, $extrinsic_index: Int) {
  extrinsic_by_pk(block_number: $block_number, extrinsic_index: $extrinsic_index) {
    args
    block_number
    doc
    extrinsic_index
    hash
    is_signed
    method
    section
    signer
    success
  }
}
`;

interface Variables {
  block_number: string;
  extrinsic_index: number;
}

interface Data {
  extrinsic_by_pk: {
    args: string;
    block_number: number;
    doc: string;
    extrinsic_index: number;
    hash: string;
    is_signed: boolean;
    method: string;
    section: string;
    signer: string;
    success: true;
  }
}

export type {
  Variables,
  Data,
}
export {
  extrinsicQuery,
}