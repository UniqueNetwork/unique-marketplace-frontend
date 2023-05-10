import { Secondary400 } from '../../styles/colors';
import { TOption } from './types';

export const sortingOptions: TOption[] = [
  {
    direction: 'desc',
    field: 'creationDate',
    iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
    id: 'desc(CreationDate)',
    title: 'Listing date'
  },
  {
    direction: 'asc',
    field: 'creationDate',
    iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
    id: 'asc(CreationDate)',
    title: 'Listing date'
  },
  {
    direction: 'desc',
    field: 'price',
    iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
    id: 'desc(Price)',
    title: 'Price'
  },
  {
    direction: 'asc',
    field: 'price',
    iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
    id: 'asc(Price)',
    title: 'Price'
  },
  {
    direction: 'desc',
    field: 'tokenId',
    iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
    id: 'desc(TokenId)',
    title: 'Token ID'
  },
  {
    direction: 'asc',
    field: 'tokenId',
    iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
    id: 'asc(TokenId)',
    title: 'Token ID'
  }
];

export const pageSize = 1000;

export const defaultSortingValue = sortingOptions[0];

export const testid = 'collection-page';
