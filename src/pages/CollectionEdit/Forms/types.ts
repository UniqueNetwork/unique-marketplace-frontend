import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';
import { MarketableCollection } from 'api/restApi/collections/types';

export type SettingsSavingProps = {
  collection: MarketableCollection;
  collectionInfo: CollectionInfoWithSchemaResponse;
  onComplete?(): Promise<void>;
};
