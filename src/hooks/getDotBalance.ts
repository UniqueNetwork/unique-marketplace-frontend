import { useCallback, useEffect, useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import BigNumber from 'bignumber.js';
import { Account } from 'account/types';

const DOT_DECIMALS = 10;
const POLKADOT_WS_URL = 'wss://rpc.polkadot.io';

interface DotBalances {
  uniqueBalance: string;
  uniqueBalanceRaw: string;
  polkadotRelayBalance: string;
  polkadotRelayBalanceRaw: string;
  isLoading: boolean;
  error: string | null;
}

export const useDotBalance = (account: Account | undefined) => {
  const [balances, setBalances] = useState<DotBalances>({
    uniqueBalance: '0',
    uniqueBalanceRaw: '0',
    polkadotRelayBalance: '0',
    polkadotRelayBalanceRaw: '0',
    isLoading: false,
    error: null,
  });

  const fetchBalances = useCallback(async () => {
    if (!account) {
      setBalances({
        uniqueBalance: '0',
        uniqueBalanceRaw: '0',
        polkadotRelayBalance: '0',
        polkadotRelayBalanceRaw: '0',
        isLoading: false,
        error: null,
      });
      return;
    }

    setBalances(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get DOT balance on Unique Network from fungibleBalances
      let uniqueBalance = '0';
      let uniqueBalanceRaw = '0';

      if (account.fungibleBalances) {
        console.log('All fungible balances:', Array.from(account.fungibleBalances.entries()));
        
        // Find DOT balance by unit field, not by key
        const dotBalance = Array.from(account.fungibleBalances.values()).find(
          balance => balance.unit === 'DOT'
        );
        
        console.log('DOT balance object:', dotBalance);
        
        if (dotBalance) {
          uniqueBalance = dotBalance.amount || '0';
          uniqueBalanceRaw = dotBalance.raw || '0';
          console.log('DOT balance on Unique Network from fungibleBalances:', {
            amount: uniqueBalance,
            raw: uniqueBalanceRaw,
            formatted: dotBalance.formatted,
            decimals: dotBalance.decimals,
          });
        } else {
          console.warn('DOT balance not found in fungibleBalances');
        }
      } else {
        console.warn('No fungibleBalances in account');
      }

      // Fetch DOT balance on Polkadot Relay Chain
      let polkadotRelayBalance = '0';
      let polkadotRelayBalanceRaw = '0';

      try {
        console.log('Connecting to Polkadot Relay Chain...');
        const provider = new WsProvider(POLKADOT_WS_URL);
        const api = await ApiPromise.create({ provider });

        console.log('Fetching Polkadot Relay balance for:', account.address);
        const accountInfo: any = await api.query.system.account(account.address);

        const free = accountInfo.data.free;
        polkadotRelayBalanceRaw = free.toString();

        const rawBalance = new BigNumber(polkadotRelayBalanceRaw);
        const divisor = new BigNumber(10).pow(DOT_DECIMALS);
        polkadotRelayBalance = rawBalance.dividedBy(divisor).toFixed();

        console.log('Polkadot Relay DOT balance:', {
          raw: polkadotRelayBalanceRaw,
          formatted: polkadotRelayBalance,
        });

        await api.disconnect();
      } catch (error) {
        console.error('Error getting DOT balance on Polkadot Relay:', error);
      }

      setBalances({
        uniqueBalance,
        uniqueBalanceRaw,
        polkadotRelayBalance,
        polkadotRelayBalanceRaw,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching DOT balances:', error);
      setBalances({
        uniqueBalance: '0',
        uniqueBalanceRaw: '0',
        polkadotRelayBalance: '0',
        polkadotRelayBalanceRaw: '0',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch DOT balances',
      });
    }
  }, [account]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    uniqueDotBalance: balances.uniqueBalance,
    uniqueDotBalanceRaw: balances.uniqueBalanceRaw,
    polkadotRelayBalance: balances.polkadotRelayBalance,
    polkadotRelayBalanceRaw: balances.polkadotRelayBalanceRaw,
    isLoading: balances.isLoading,
    error: balances.error,
    refetch: fetchBalances,
  };
};