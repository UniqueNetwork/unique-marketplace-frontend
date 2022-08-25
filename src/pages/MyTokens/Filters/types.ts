import { Dispatch, SetStateAction } from 'react';
import { Statuses } from 'components/Filters/types';
import { NFTCollection, NFTToken } from 'api/uniqueSdk/types';

export type MyTokensStatuses = Record<'onSell' | 'fixedPrice' | 'timedAuction' | 'notOnSale', boolean | undefined>;

export type PriceRange = {
    minPrice?: string
    maxPrice?: string
};

export type MyTokensFilterState = Omit<FilterState, 'statuses'> & {
    statuses?: MyTokensStatuses | undefined
};

export type AttributeItem = { key: string, attribute: string };

export type FilterState = {
    statuses?: Statuses | undefined
    prices?: PriceRange | undefined
    collections?: number[]
    attributes?: AttributeItem[]
    attributeCounts?: number[]
};

export type FilterChangeHandler<T> = Dispatch<SetStateAction<T | null>> | ((value: T | null) => void);

export type FiltersProps<T = FilterState> = {
    value: T | null
    onFilterChange: FilterChangeHandler<T>
    tokens: NFTToken[]
    featuredTokens: NFTToken[]
    collections: NFTCollection[]
    isFetchingTokens: boolean
    testid: string
    featuredTokensForAttributeCounts: NFTToken[]
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
