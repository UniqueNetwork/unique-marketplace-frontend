import { Consumer, Context, createContext, Provider } from 'react';
import { CollectionInfoWithSchema } from '@unique-nft/substrate-client/tokens';

export type CollectionsContextProps = {
  isFetching: boolean
  collections: CollectionInfoWithSchema[]
  fetchCollections(): Promise<void>
}

const CollectionsContext: Context<CollectionsContextProps> = createContext({} as unknown as CollectionsContextProps);
const CollectionsConsumer: Consumer<CollectionsContextProps> = CollectionsContext.Consumer;
const CollectionsProvider: Provider<CollectionsContextProps> = CollectionsContext.Provider;

export default CollectionsContext;

export { CollectionsConsumer, CollectionsProvider };
