import { AttributeFieldOptional, AttributeFieldType, Warning } from './types';

export const enum CREATE_COLLECTION_TABS_ROUTE {
  MAIN_INFORMATION = 'main-information',
  COLLECTIONS_SETTINGS = 'collection-settings',
  LINKS = 'collection-links',
}

export const tabsUrls = [
  `${CREATE_COLLECTION_TABS_ROUTE.MAIN_INFORMATION}`,
  `${CREATE_COLLECTION_TABS_ROUTE.COLLECTIONS_SETTINGS}`,
  `${CREATE_COLLECTION_TABS_ROUTE.LINKS}`
];

export const warnings: Record<string, Warning> = {
  coverIsNotDefine: {
    title: "Warning! You haven't entered the cover.",
    description:
      "Are you sure that you want to create the collection without it? You can't return to editing the cover in this product version."
  },
};

export const types: AttributeFieldType[] = [
  { id: 'string', title: 'Text' },
  { id: 'enum', title: 'Select' },
  { id: 'repeated', title: 'Multiselect' }
];

export const rules: AttributeFieldOptional[] = [
  { id: 'optional', title: 'Optional' },
  { id: 'required', title: 'Required' }
];

export const FORM_ERRORS = {
  INVALID_ADDRESS: 'Please enter a valid address',
  REQUIRED_FIELDS: 'You did not fill in the required fields',
  INSUFFICIENT_BALANCE: "You don't have enough ",
  INVALID_AMOUNT: 'Amount must be a positive number greater than zero'
};
