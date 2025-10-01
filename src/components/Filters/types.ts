import { Dispatch, SetStateAction } from 'react';
import { Attribute, AttributeCount } from '../../api/restApi/offers/types';

export type Statuses = Record<'myNFTs' | 'fixedPrice' | 'timedAuction' | 'myBets', boolean | undefined>

export type PriceRange = {
  minPrice?: string
  maxPrice?: string
};

export enum TypeOfAssets {
  All = 'all',
  NFTs = 'NFTs',
  CustomizableNFTs = 'Customizable NFTs'
}
export enum TypeOfCustomizableNFTs {
  All = 'all',
  Base = 'Base NFTs',
  Wearables = 'NFT Wearables',
}

export type AttributeItem = { key: string, attribute: string };

export type FilterState = {
  statuses?: Statuses | undefined
  typeOfAssets?: TypeOfAssets | undefined
  typeOfCustomizableNFTs?: TypeOfCustomizableNFTs | undefined
  prices?: PriceRange | undefined
  collections?: number[]
  attributes?: AttributeItem[]
  attributeCounts?: number[]
  currencies?: number[]
};

export type FilterChangeHandler<T> = Dispatch<SetStateAction<T | null>> | ((value: T | null) => void);

export type FiltersProps<T = FilterState> = {
  value: T | null
  attributes?: Record<string, Attribute[]>
  attributeCounts?: AttributeCount[]
  onFilterChange: FilterChangeHandler<T>
  testid: string
  disabled?: boolean
}
