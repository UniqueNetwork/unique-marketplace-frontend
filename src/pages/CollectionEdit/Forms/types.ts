import { CollectionWithInfoV2Dto } from '@unique-nft/sdk';
import { MarketableCollection } from 'api/restApi/collections/types';

export type SettingsSavingProps = {
  collection: MarketableCollection;
  collectionInfo: CollectionWithInfoV2Dto;
  onComplete?(): Promise<void>;
};
