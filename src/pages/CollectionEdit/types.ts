import { MarketAccount } from 'account/types';

export type CollectionFormData = {
  description: string;
  website: string;
  discord: string;
  twitter: string;
  instagram: string;
  telegram: string;
  reddit: string;
};

export type RoyaltiesFormData = {
  address: string | MarketAccount;
  value: string;
};
