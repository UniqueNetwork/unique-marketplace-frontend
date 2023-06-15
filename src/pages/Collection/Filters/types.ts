import { FilterState } from 'components/Filters/types';

export type BelongingValue = 'All' | 'Owned' | 'Disowned';

export type TokensFilter = FilterState & { belongingValue?: BelongingValue };
