import { FC, useCallback, useEffect, useMemo, useState, ReactNode } from 'react';
import { Address } from '@unique-nft/utils';

import { Account, BaseWalletType, WalletsType } from './types';
import { CONNECTED_WALLET_TYPE, ConnectedWalletsName, useWalletCenter } from './useWalletCenter';

import { DefaultAccountKey } from './constants';
import { AccountProvider } from './AccountContext';
import { useApi } from 'hooks/useApi';
import { useBalanceSubscriptions } from './useBalanceSubscriptions';
import { useAccount } from 'wagmi';
import { getNumericChainId, useEthersSigner } from './WalletConnectContext/useSigner';
import { useWeb3ModalCustom } from './WalletConnectContext/Web3ModalContext';

interface AccountWrapperProps {
  children: ReactNode;
}

export const AccountWrapper: FC<AccountWrapperProps> = ({ children }) => {
  const { chainProperties, api } = useApi();
  const [accounts, setAccounts] = useState<Map<string, BaseWalletType<WalletsType>>>(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchAccountsError, setFetchAccountsError] = useState<string | undefined>();
  const [selectedAccount, setSelectedAccount] = useState<Account>();
  const { currentChainId: chainId } = useApi();
  const { address: ethereumAddress } = useAccount();

  // const { address: ethereumAddress, status: appKitStatus, isConnected } = useAppKitAccount();
  // const { walletProvider } = useAppKitProvider('eip155');
  
  const walletsCenter = useWalletCenter(chainProperties);
  const { subscribeBalancesChanges, isBalancesFetching } = useBalanceSubscriptions();

  useEffect(() => {
    setAccounts((accounts) => {
      return Array.from(accounts.values()).reduce((acc, account) => {
        if (Address.is.ethereumAddressInAnyForm(account.address)) {
          acc.set(account.address, account);
          return acc;
        }
        const address = Address.normalize.substrateAddress(
          account.address,
          chainProperties?.SS58Prefix
        );
        acc.set(address, { ...account, address });
        return acc;
      }, new Map<string, BaseWalletType<WalletsType>>());
    });

    setSelectedAccount((account) => {
      if (!account || Address.is.ethereumAddressInAnyForm(account.address)) {
        return account;
      }
      const address = Address.normalize.substrateAddress(
        account.address,
        chainProperties?.SS58Prefix
      );
      return { ...account, address };
    });
  }, [chainProperties]);

  const changeAccount = useCallback(
    (account: Account) => {
      if (selectedAccount?.address === account.address) {
        return;
      }
      localStorage.setItem(DefaultAccountKey, account.normalizedAddress);
      setSelectedAccount(account);
    },
    [selectedAccount?.address]
  );

  useEffect(() => {
    if (!accounts?.size || isLoading) {
      return;
    }

    const defaultAccountNormalizedAddress = localStorage.getItem(DefaultAccountKey) || '';

    const defaultAccountAddress = defaultAccountNormalizedAddress
      ? Address.is.ethereumAddressInAnyForm(defaultAccountNormalizedAddress)
        ? defaultAccountNormalizedAddress
        : Address.normalize.substrateAddress(defaultAccountNormalizedAddress, chainProperties?.SS58Prefix)
      : '';

    const defaultAccount = accounts.get(defaultAccountAddress);

    const [firstAccount] = accounts.keys();
    const account = accounts.get(firstAccount);
    const selectedAccount = defaultAccount || account;
    if (selectedAccount) {
      changeAccount(selectedAccount);
    }
  }, [accounts, changeAccount, isLoading]);

  useEffect(() => {
    const handleWalletConnection = () => {
      if (!ethereumAddress) return;
  
      const accountExists = accounts.has(ethereumAddress);
      if (!accountExists) {

        setTimeout(handleReownWallet, 500);
      }
    };
  
    handleWalletConnection();
  }, [ethereumAddress]);
  
  const [previousEthereumAddress, setPreviousEthereumAddress] = useState<string | undefined>();

  const { reinitializeWithChainName } = useWeb3ModalCustom();

  useEffect(() => {
    if (!ethereumAddress && previousEthereumAddress) {
      setAccounts((prevAccounts) => {
        const updatedAccounts = new Map(prevAccounts);
  
        if (previousEthereumAddress) {
          updatedAccounts.delete(previousEthereumAddress);
        }
  
        return updatedAccounts;
      });
    }
  
    if (ethereumAddress && chainId) {
      setPreviousEthereumAddress(ethereumAddress);
      reinitializeWithChainName(chainId)
    }
  }, [ethereumAddress, previousEthereumAddress]);
  
  const signer = useEthersSigner();

  const handleReownWallet = useCallback(async () => {
    if (!signer) return;
    const newWallets = await walletsCenter.connectReownWallet(signer);
  
    setAccounts((prevAccounts) => {
      const updatedAccounts = new Map(prevAccounts);
      newWallets.forEach((account, address) => {
        updatedAccounts.set(address, account);
      });
      return updatedAccounts;
    });
  }, [signer]);
  

  const fetchAccounts = useCallback(() => {
    if (!chainProperties || !api?.market?.uniqueSdk) return;
  
    setIsLoading(true);
    const walletsFromStorage = localStorage.getItem(CONNECTED_WALLET_TYPE)?.split(';') as ConnectedWalletsName[] || [];
    const walletsSet = new Set(walletsFromStorage);
    if (signer) {
      walletsSet.add('reown');
    }
  
    const wallets = Array.from(walletsSet);
  
    const connectedWalletPromises = wallets.map((typeWallet) => {
      if (typeWallet === 'reown') {
        if (signer) {
          return walletsCenter.connectReownWallet(signer);
        } else {
          return Promise.resolve(new Map());
        }
      } else {
        return walletsCenter.connectWallet(typeWallet);
      }
    });
  
    if (!connectedWalletPromises.length) {
      setIsLoading(false);
      return;
    }
  
    void Promise.allSettled(connectedWalletPromises)
      .then((results) => {
        const map = new Map();
        results.forEach((result) => {
          if (result.status !== 'fulfilled' || !result.value) return;
          result.value.forEach((acc, address) => {
            map.set(address, acc);
          });
        });
  
        void (async () => {
          setAccounts(await subscribeBalancesChanges(map, setAccounts));
          setIsLoading(false);
        })();
      });
  }, [chainProperties, api?.market?.uniqueSdk, signer]);
  
  useEffect(fetchAccounts, [fetchAccounts]);


  const value = useMemo(
    () => ({
      isLoading: isLoading || isBalancesFetching,
      accounts,
      selectedAccount,
      fetchAccountsError,
      changeAccount,
      setFetchAccountsError,
      setIsLoading,
      walletsCenter,
      fetchAccounts
    }),
    [
      isLoading,
      isBalancesFetching,
      accounts,
      selectedAccount,
      fetchAccountsError,
      changeAccount,
      walletsCenter,
      fetchAccounts
    ]
  );

  return (
    <AccountProvider value={value}>
      {children}
    </AccountProvider>
  );
};
