import { Dispatch, SetStateAction } from 'react';
import { Statuses, TypeOfAssets, TypeOfCustomizableNFTs } from 'components/Filters/types';
import { MixedMyTokenAndOffer } from '../types';
import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';

export type MyTokensStatuses = Record<'onSell' | 'fixedPrice' | 'timedAuction' | 'notOnSale', boolean | undefined>;

export type PriceRange = {
    minPrice?: string
    maxPrice?: string
};

export type AttributeItem = { key: string, attribute: string };

export type MyTokensFilterState = {
    statuses?: MyTokensStatuses | undefined
    typeOfAssets?: TypeOfAssets | undefined
    typeOfCustomizableNFTs?: TypeOfCustomizableNFTs | undefined
    prices?: PriceRange | undefined
    collections?: number[]
    attributes?: AttributeItem[]
    attributeCounts?: number[]
};

export type FilterChangeHandler<T> = Dispatch<SetStateAction<T | null>> | ((value: T | null) => void);

export type FiltersProps<T = MyTokensFilterState> = {
    value: T | null
    onFilterChange: FilterChangeHandler<T>
    tokens: MixedMyTokenAndOffer[]
    featuredTokens: MixedMyTokenAndOffer[]
    collections: CollectionInfoWithSchemaResponse[]
    isFetchingTokens: boolean
    testid: string
    featuredTokensForAttributeCounts: MixedMyTokenAndOffer[]
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
