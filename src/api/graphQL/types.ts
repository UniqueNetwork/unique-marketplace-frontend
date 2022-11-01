export enum GQLOrderByParamsArgs {
  asc = 'asc',
  asc_nulls_first = 'asc_nulls_first',
  asc_nulls_last = 'asc_nulls_last',
  desc = 'desc',
  desc_nulls_first = 'desc_nulls_first',
  desc_nulls_last = 'desc_nulls_last',
}

export type GQLWhereOpsInt = {
  _eq?: number;
  _ilike?: number;
  _in?: number[];
  _like?: number;
  _neq?: number;
};

export type GQLWhereOpsString = {
  _eq?: string;
  _ilike?: string;
  _in?: string[];
  _like?: string;
  _neq?: string;
};

export type Sorting = Record<
  string,
  | string
  | 'asc'
  | 'desc'
  | 'desc_nulls_last'
  | 'asc_nulls_last'
  | 'asc_nulls_first'
  | 'desc_nulls_first'
  | undefined
>;
