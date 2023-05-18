import { Consumer, Context, createContext, Provider } from 'react';
import { AccountContextProps } from './types';

const AccountContext: Context<AccountContextProps> = createContext({} as unknown as AccountContextProps);
const AccountConsumer: Consumer<AccountContextProps> = AccountContext.Consumer;
const AccountProvider: Provider<AccountContextProps> = AccountContext.Provider;

export default AccountContext;

export { AccountConsumer, AccountProvider };
