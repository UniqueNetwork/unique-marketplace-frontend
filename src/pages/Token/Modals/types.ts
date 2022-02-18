import { Token } from '../../../api/graphQL/tokens/types';

export type TTransfer = {
  recipient: string
}

export type TFixPriceProps = {
  price: number // float number
}

export type TAuctionProps = {
  minimumStep: number,
  startingPrice: number,
  duration: number // timestamp in ms's
}

export interface ModalProps {
  token?: Token,
  [key: string]: any
}
