import { useEffect, useState, useCallback } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import BigNumber from 'bignumber.js';
import { Account } from 'account/types';

const WUD_DECIMALS = 10;
const WUD_AH_ASSET_ID = 31337;
const ASSETHUB_WS_URL = 'wss://polkadot-asset-hub-rpc.polkadot.io';
const HYDRATION_WS_URL = 'wss://rpc.hydradx.cloud';

interface WudBalanceResult {
  uniqueWudBalance: string;
  uniqueWudBalanceRaw: string;
  assetHubWudBalance: string;
  assetHubWudBalanceRaw: string;
  hydrationWudBalance: string;
  hydrationWudBalanceRaw: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useWudBalance = (account: Account | undefined): WudBalanceResult => {
  const [balances, setBalances] = useState({
    uniqueWudBalance: '0',
    uniqueWudBalanceRaw: '0',
    assetHubWudBalance: '0',
    assetHubWudBalanceRaw: '0',
    hydrationWudBalance: '0',
    hydrationWudBalanceRaw: '0',
    isLoading: false,
    error: null as string | null,
  });

  const fetchBalances = useCallback(async () => {
    if (!account) {
      setBalances({
        uniqueWudBalance: '0',
        uniqueWudBalanceRaw: '0',
        assetHubWudBalance: '0',
        assetHubWudBalanceRaw: '0',
        hydrationWudBalance: '0',
        hydrationWudBalanceRaw: '0',
        isLoading: false,
        error: null,
      });
      return;
    }

    setBalances(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get WUD balance on Unique Network from fungibleBalances
      let uniqueWudBalance = '0';
      let uniqueWudBalanceRaw = '0';

      if (account.fungibleBalances) {
        console.log('Searching for WUD in fungibleBalances...');
        
        // Find WUD balance by unit field
        const wudBalance = Array.from(account.fungibleBalances.values()).find(
          balance => balance.unit === 'WUD'
        );
        
        console.log('WUD balance object:', wudBalance);
        
        if (wudBalance) {
          uniqueWudBalance = wudBalance.amount || '0';
          uniqueWudBalanceRaw = wudBalance.raw || '0';
          console.log('WUD balance on Unique Network:', {
            amount: uniqueWudBalance,
            raw: uniqueWudBalanceRaw,
            formatted: wudBalance.formatted,
            decimals: wudBalance.decimals,
          });
        } else {
          console.warn('WUD balance not found in fungibleBalances');
        }
      } else {
        console.warn('No fungibleBalances in account');
      }

      // Fetch WUD balance on Asset Hub
      let assetHubWudBalance = '0';
      let assetHubWudBalanceRaw = '0';

      try {
        console.log('Connecting to Asset Hub...');
        const assetHubProvider = new WsProvider(ASSETHUB_WS_URL);
        const assetHubApi = await ApiPromise.create({ provider: assetHubProvider });

        console.log('Fetching Asset Hub WUD balance for:', account.address);
        const assetBalanceQuery = await assetHubApi.query.assets.account(
          WUD_AH_ASSET_ID,
          account.address
        );

        if (assetBalanceQuery.isSome) {
          const balanceData = assetBalanceQuery.unwrap() as any;
          assetHubWudBalanceRaw = balanceData.balance.toString();
          
          const rawBalance = new BigNumber(assetHubWudBalanceRaw);
          const divisor = new BigNumber(10).pow(WUD_DECIMALS);
          assetHubWudBalance = rawBalance.dividedBy(divisor).toFixed();

          console.log('Asset Hub WUD balance:', {
            raw: assetHubWudBalanceRaw,
            formatted: assetHubWudBalance,
          });
        }

        await assetHubApi.disconnect();
      } catch (error) {
        console.error('Error getting WUD balance on Asset Hub:', error);
      }

      // Fetch WUD balance on Hydration
      let hydrationWudBalance = '0';
      let hydrationWudBalanceRaw = '0';

      try {
        console.log('Connecting to Hydration...');
        const hydrationProvider = new WsProvider(HYDRATION_WS_URL);
        const hydrationApi = await ApiPromise.create({ provider: hydrationProvider });

        console.log('Fetching Hydration WUD balance for:', account.address);
        
        // Try different methods to query Hydration balance
        // Method 1: tokens.accounts
        try {
          const tokenBalanceQuery = await hydrationApi.query.tokens.accounts(
            account.address,
            { Token: 'WUD' }
          ) as any;

          if (tokenBalanceQuery && tokenBalanceQuery.free) {
            hydrationWudBalanceRaw = tokenBalanceQuery.free.toString();
            
            const rawBalance = new BigNumber(hydrationWudBalanceRaw);
            const divisor = new BigNumber(10).pow(WUD_DECIMALS);
            hydrationWudBalance = rawBalance.dividedBy(divisor).toFixed();

            console.log('Hydration WUD balance (tokens.accounts):', {
              raw: hydrationWudBalanceRaw,
              formatted: hydrationWudBalance,
            });
          }
        } catch (tokensError) {
          console.warn('tokens.accounts query failed, trying alternative...');
          
          // Method 2: assetRegistry or other methods
          // This depends on how Hydration stores WUD
        }

        await hydrationApi.disconnect();
      } catch (error) {
        console.error('Error getting WUD balance on Hydration:', error);
      }

      setBalances({
        uniqueWudBalance,
        uniqueWudBalanceRaw,
        assetHubWudBalance,
        assetHubWudBalanceRaw,
        hydrationWudBalance,
        hydrationWudBalanceRaw,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching WUD balances:', error);
      setBalances({
        uniqueWudBalance: '0',
        uniqueWudBalanceRaw: '0',
        assetHubWudBalance: '0',
        assetHubWudBalanceRaw: '0',
        hydrationWudBalance: '0',
        hydrationWudBalanceRaw: '0',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch WUD balances',
      });
    }
  }, [account]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    uniqueWudBalance: balances.uniqueWudBalance,
    uniqueWudBalanceRaw: balances.uniqueWudBalanceRaw,
    assetHubWudBalance: balances.assetHubWudBalance,
    assetHubWudBalanceRaw: balances.assetHubWudBalanceRaw,
    hydrationWudBalance: balances.hydrationWudBalance,
    hydrationWudBalanceRaw: balances.hydrationWudBalanceRaw,
    isLoading: balances.isLoading,
    error: balances.error,
    refetch: fetchBalances,
  };
};