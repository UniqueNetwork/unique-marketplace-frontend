import { Collection } from 'api/graphQL/collections/types';
import { Consumer, Context, createContext, Provider } from 'react';

export type CollectionsContextProps = {
  isFetching: boolean
  collections: Collection[]
}

const CollectionsContext: Context<CollectionsContextProps> = createContext({} as unknown as CollectionsContextProps);
const CollectionsConsumer: Consumer<CollectionsContextProps> = CollectionsContext.Consumer;
const CollectionsProvider: Provider<CollectionsContextProps> = CollectionsContext.Provider;

export default CollectionsContext;

export { CollectionsConsumer, CollectionsProvider };
