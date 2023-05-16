import { FilterState, FiltersProps as CommonFiltersProps } from 'components/Filters/types';
import { MixedTokenAndOffer } from 'pages/MyTokens/types';

export type TokensStatuses = Record<'onSell' | 'fixedPrice' | 'timedAuction' | 'notOnSale', boolean | undefined>;

export type PriceRange = {
    minPrice?: string
    maxPrice?: string
};

export type CollectionFilterState = Omit<FilterState, 'statuses'> & {
    statuses?: TokensStatuses | undefined
};

export type FiltersProps = CommonFiltersProps<CollectionFilterState> & {
  tokens: MixedTokenAndOffer[]
  featuredTokens: MixedTokenAndOffer[]
  featuredTokensForAttributeCounts: MixedTokenAndOffer[]
  isFetchingTokens: boolean
}

export type TFilterAttribute = {
    key: string
    count: number
}

export type TFilterAttributes = {
    [key: string]: TFilterAttribute[]
}

export type TFilterAttributeCount = {
    numberOfAttributes: number
    amount: number
}
