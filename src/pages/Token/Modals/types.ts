export type TTransfer = {
  sender: string
  recipient: string
}

export type TFixPriceProps = {
  accountAddress: string
  price: string // float number
}

export type TPurchaseProps = {
  accountAddress: string
}

export type TDelistProps = {
  accountAddress: string
}

export type TAuctionProps = {
  accountAddress: string
  minimumStep: string
  startingPrice: string
  duration: number // days number
}

export type TPlaceABid = {
  accountAddress?: string
  amount?: string
}

export type TAuctionBidProps = {
  value: string
  accountAddress: string
}
