import { PriceRange, Statuses } from '../../../components/Filters/types';
import { Dispatch, SetStateAction } from 'react';
import { NFTCollection, NFTToken } from '../../../api/chainApi/unique/types';

export type MyTokensStatuses = Record<'onSell' | 'fixedPrice' | 'timedAuction' | 'notOnSale', boolean | undefined>;

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
    collections: NFTCollection[]
    isFetchingTokens: boolean
}
