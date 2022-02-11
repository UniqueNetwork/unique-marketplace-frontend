import { Reducer } from 'react';

export type Statuses = Record<'myNFTs' | 'fixedPrice' | 'timedAuction' | 'myBets', boolean | undefined>

export type PriceRange = {
  minPrice: number
  maxPrice: number
}

export type FilterState = Record<string, number | string | undefined | number[]>;

export type FilterReducer = Reducer<
  FilterState,
  {action: 'status', value: Statuses}
  | {action: 'price', value: PriceRange | undefined}
  | {action: 'collections', value: number[]}
  | {action: 'attribute', value: string[]}
  >;
