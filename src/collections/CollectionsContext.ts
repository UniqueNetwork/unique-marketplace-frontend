import { Consumer, Context, createContext, Provider } from 'react';
import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';

export type CollectionsContextProps = {
  isFetching: boolean
  collections: CollectionInfoWithSchemaResponse[]
  fetchCollections(): Promise<void>
}

const CollectionsContext: Context<CollectionsContextProps> = createContext({} as unknown as CollectionsContextProps);
const CollectionsConsumer: Consumer<CollectionsContextProps> = CollectionsContext.Consumer;
const CollectionsProvider: Provider<CollectionsContextProps> = CollectionsContext.Provider;

export default CollectionsContext;

export { CollectionsConsumer, CollectionsProvider };
