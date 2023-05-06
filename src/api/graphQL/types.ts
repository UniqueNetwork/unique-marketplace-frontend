export type Direction = 'asc' | 'desc';

export interface QueryResponse<TData = void, dateKey extends string = 'data'> {
  [key: string]: {
    [K in dateKey]?: TData[]
  } & {
    count?: number
  }
}

type GQLWhereOps = '_eq' | '_ilike' | '_in' | '_is_null' | '_like' | '_neq';

type WhereParams<TData = any> = {
  [key in keyof TData]: Record<GQLWhereOps, string | number | boolean>
} & {
  _or?: WhereParams<TData>
  _and?: WhereParams<TData>
};

export interface QueryVariables<TData = any> {
  limit: number
  offset: number
  order_by?: Record<keyof TData, Direction>
  where?: WhereParams<TData>
}
