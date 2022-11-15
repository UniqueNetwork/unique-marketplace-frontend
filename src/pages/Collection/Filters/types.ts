import { FilterState, FiltersProps as CommonFiltersProps } from 'components/Filters/types';
import { TokenByIdResult } from '@unique-nft/substrate-client/tokens';
import { Offer } from '../../../api/restApi/offers/types';

export type TokensStatuses = Record<'onSell' | 'fixedPrice' | 'timedAuction' | 'notOnSale', boolean | undefined>;

export type PriceRange = {
    minPrice?: string
    maxPrice?: string
};

export type CollectionFilterState = Omit<FilterState, 'statuses'> & {
    statuses?: TokensStatuses | undefined
};

export type FiltersProps = CommonFiltersProps<CollectionFilterState> & {
  tokens: (TokenByIdResult & Partial<Offer>)[]
  featuredTokens: (TokenByIdResult & Partial<Offer>)[]
  featuredTokensForAttributeCounts: (TokenByIdResult & Partial<Offer>)[]
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
