import { Consumer, Context, createContext, Provider } from 'react';
import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';
import { GQLCollection } from 'api/scanApi/types';

export type CollectionsContextProps = {
  isFetching: boolean
  collections: GQLCollection[]
  curatedCollections: CollectionInfoWithSchemaResponse[]
  offset: number
  totalCount: number,
  fetchCollections(): void
}

const CollectionsContext: Context<CollectionsContextProps> = createContext({} as unknown as CollectionsContextProps);
const CollectionsConsumer: Consumer<CollectionsContextProps> = CollectionsContext.Consumer;
const CollectionsProvider: Provider<CollectionsContextProps> = CollectionsContext.Provider;

export default CollectionsContext;

export { CollectionsConsumer, CollectionsProvider };
