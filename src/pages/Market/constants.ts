import { Secondary400 } from 'styles/colors';
import { TOption } from './types';

export const pageSize = 20;

export const testid = 'market-page';

export const sortingOptions: TOption[] = [
  {
    iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
    id: 'desc(CreationDate)',
    title: 'Listing date'
  },
  {
    iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
    id: 'asc(CreationDate)',
    title: 'Listing date'
  },
  {
    iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
    id: 'desc(Price)',
    title: 'Price'
  },
  {
    iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
    id: 'asc(Price)',
    title: 'Price'
  },
  {
    iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
    id: 'desc(TokenId)',
    title: 'Token ID'
  },
  {
    iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
    id: 'asc(TokenId)',
    title: 'Token ID'
  }
];

export const defaultSortingValue = sortingOptions[0];
