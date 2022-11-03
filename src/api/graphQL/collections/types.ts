import { Sorting } from '../types';

export interface AttributeField {
  isArray: boolean;
  name: {
    _: string;
  };
  optional: boolean;
  type: string;
}

export interface Attributes {
  [key: string]: AttributeField;
}

export interface Collection {
  id: number;
  name: string;
  tokenPrefix: string;
  description: string;
  owner: string;
  burned?: boolean;
  collectionCover: string;
  nestingEnabled: boolean
  tokenLimit: number;
  tokensCount: number;
  holdersCount: number;
  mode?: string
}

export interface CollectionsVariables {
  limit: number;
  offset: number;
  where?: Record<string, unknown>;
  orderBy?: Sorting;
}

export interface CollectionsData {
  collections: {
    data: Collection[];
    count: number;
    timestamp: number;
  };
}

export type CollectionSorting = {
  [P in keyof Collection]?:
    | 'asc'
    | 'desc'
    | 'desc_nulls_last'
    | 'asc_nulls_last'
    | 'asc_nulls_first'
    | 'desc_nulls_first';
};

export type useGraphQlCollectionsProps = {
  pageSize: number;
  offset?: number;
  orderBy?: CollectionSorting;
  filter?: Record<string, unknown>;
  searchString?: string;
};
