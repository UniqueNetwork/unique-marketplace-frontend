import { FilterState } from '../../../components/Filters/types';

export type MyTokensStatuses = Record<'onSell' | 'fixedPrice' | 'timedAuction' | 'notOnSale', boolean | undefined>;

export type MyTokensFilterState = Omit<FilterState, 'statuses'> & {
    statuses?: MyTokensStatuses | undefined
};
