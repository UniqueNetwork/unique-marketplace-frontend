import { BN } from '@polkadot/util';
import { SocketClient, SubscriptionEvents } from '@unique-nft/sdk/full';
import { Address } from '@unique-nft/utils';
import { useApi } from 'hooks/useApi';
import { Dispatch, SetStateAction, useCallback, useRef, useState } from 'react';
import { Account } from './types';

export const useBalanceSubscriptions = () => {
  const { api, chainProperties, currencies: erc20Tokens, setCurrencies } = useApi();
  const sdkSocketClient = useRef<SocketClient>();
  const [isBalancesFetching, setIsBalancesFetching] = useState(false);

const subscribeBalancesChanges = useCallback(async (
    accounts: Map<string, Account>,
    setAccounts: Dispatch<SetStateAction<Map<string, Account>>>
  ) => {
    setIsBalancesFetching(true);
    const sdk = api?.market?.uniqueSdk;

    if (!sdk) return new Map();
    // always recreate client just in case (ex. network changed) whenever accounts refetched
    const client: SocketClient = sdk.subscription.connect({
      transports: ['websocket']
    });
    if (sdkSocketClient.current) {
      sdkSocketClient.current.socket.removeAllListeners();
    }
    const getBalance = async (account: Account) => {
      const balances = await api?.market?.getAccountBalance(account.address);
      const fungibleBalances = new Map();

      for (const token of erc20Tokens) {
        if (token.collectionId) {
          try {
            const erc20 = await api?.market?.getAccountBalanceFungible({
              collectionId: token.collectionId,
              address: account.address
            });
            fungibleBalances.set(String(token.collectionId), erc20);
          } catch (error) {
            console.error(`Error fetching balance for ${token.title}:`, error);
          }
        }
      }

      const erc20TokensWithTitle = erc20Tokens.map((token) => ({...token, title: fungibleBalances.get(String(token.collectionId))?.unit || chainProperties?.token }));
      setCurrencies(erc20TokensWithTitle);
      return { ...account, balances, fungibleBalances };
    };

    const accountsWithBalances = await Promise.all([...accounts.values()].map(getBalance));
    const map = new Map(accountsWithBalances.map((account) => [
      account.address, account
    ]));

    setIsBalancesFetching(false);

    accountsWithBalances.forEach((account) => {
      if (Address.is.substrateAddress(account.address)) {
        client.subscribeAccountCurrentBalance({ address: Address.is.substrateAddress(account.address)
          ? Address.normalize.substrateAddress(account.address, chainProperties?.SS58Prefix)
          : account.address });
        
        client.subscribeCollection({ collectionId: 2807, signer: Address.is.substrateAddress(account.address)
          ? Address.normalize.substrateAddress(account.address, chainProperties?.SS58Prefix)
          : account.address });

        const ethMirror = Address.mirror.substrateToEthereum(account.address);
        client.subscribeAccountCurrentBalance({ address: Address.mirror.ethereumToSubstrate(ethMirror, chainProperties?.SS58Prefix) });
        client.subscribeCollection({ collectionId: 2807, signer: Address.mirror.ethereumToSubstrate(ethMirror, chainProperties?.SS58Prefix) });
      } else {
        const substrateMirror = Address.mirror.ethereumToSubstrate(account.address, chainProperties?.SS58Prefix);
        client.subscribeAccountCurrentBalance({ address: substrateMirror });
        client.subscribeCollection({ collectionId: 2807, signer: substrateMirror });
      }
    });

    const getAddress = (addresses: string[], address: string) => {
      if (addresses.length === 0) {
        return undefined;
      }
      if (!address) {
        return undefined;
      }

      if (addresses.map(
        (addr) => addr.toLowerCase()
      ).includes(address.toLowerCase())) {
        return address;
      }
      return addresses
              .filter(Address.is.ethereumAddressInAnyForm)
              .find((ethAddress) => {
                const substrateMirror = Address.mirror.ethereumToSubstrate(ethAddress, chainProperties?.SS58Prefix);
                return Address.compare.substrateAddresses(substrateMirror, address);
              });
    };

    const getSubstrateMirrorAddress = (addresses: string[], address: string) => {
      return addresses
            .filter(Address.is.substrateAddressInAnyForm)
            .find((substrateAddress) => {
              const ethMirror = Address.mirror.substrateToEthereum(substrateAddress);
              const substrateMirror = Address.mirror.ethereumToSubstrate(ethMirror, chainProperties?.SS58Prefix);
              return Address.compare.substrateAddresses(substrateMirror, address);
            });
    };

    client.on(SubscriptionEvents.COLLECTIONS, (_, data) => {
      try {
        const address = data.parsed.address;
        const addressTo = data.parsed.addressTo;
        const amount = data.parsed.amount;
        const collectionId = data.parsed.collectionId;

        setAccounts((accounts)=> {
          const accountsCopy = new Map(accounts);
          if (!accounts || !addressTo || !amount || !address) return accountsCopy;

          const updateAccountBalance = (  account: Account | undefined,
            collectionId: string,
            amountChange: number) => {
            if (!account || !account.fungibleBalances) return false;
            
            const fungibleTokenItem = account.fungibleBalances?.get(String(collectionId));
            if (!fungibleTokenItem) return false;
            
            const updatedRawAmount = Number(fungibleTokenItem.raw) + amountChange;
            
            account.fungibleBalances.set(String(collectionId), {
              ...fungibleTokenItem,
              amount: (updatedRawAmount / (10 ** fungibleTokenItem.decimals)).toFixed(4),
              raw: String(updatedRawAmount),
            });
            return true;
          };
          
          const amountNumber = Number(amount);
          
          const accountTo = accountsCopy.get(addressTo);
          updateAccountBalance(accountTo, String(collectionId), amountNumber);
          
          const accountFrom = accountsCopy.get(address);
          updateAccountBalance(accountFrom, String(collectionId), -amountNumber);
          
          return accountsCopy;     
        });
      } catch (e) {
        console.error('Failed to get balance update: ', e);
      }
    });

    client.on(SubscriptionEvents.ACCOUNT_CURRENT_BALANCE, (_, data) => {
      try {
        const address = data.balance.address;
        const newBalance = data.balance.availableBalance;

        setAccounts((accounts) => {
          const accountsCopy = new Map(accounts);
          const addresses = [...accountsCopy.keys()];
          let accountAddress = getAddress(addresses, address);

          if (accountAddress) {
            const account = accountsCopy.get(accountAddress);
            if (account) {
              account.balances = {
                proper: {
                  raw: new BN(newBalance.raw),
                  parsed: newBalance.amount
                },
                ethMirror: account.balances?.ethMirror || {
                  raw: new BN(0),
                  parsed: '0'
                }
              };
              return accountsCopy;
            }
          }

          accountAddress = getSubstrateMirrorAddress(addresses, address);

          if (accountAddress) {
            const account = accountsCopy.get(accountAddress);

            if (!account) {
              return accountsCopy;
            }

            account.balances = {
              proper: account.balances?.proper || {
                raw: new BN(0),
                parsed: '0'
              },
              ethMirror: {
                raw: new BN(newBalance.raw),
                parsed: newBalance.amount
              }
            };
          }

          return accountsCopy;
        });
      } catch (e) {
        console.error('Failed to get balance update: ', e);
      }
    });
    sdkSocketClient.current = client;
    return map;
  }, [api]);

  return { subscribeBalancesChanges, isBalancesFetching };
};
