export type Statuses = Record<'myNFTs' | 'fixedPrice' | 'timedAuction' | 'myBets', boolean | undefined>

export type PriceRange = {
  minPrice: string
  maxPrice: string
}

export type FilterState = Record<string, number | string | undefined | number[] | boolean>;
