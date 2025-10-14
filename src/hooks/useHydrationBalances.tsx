import { useEffect, useState, useCallback } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import BigNumber from 'bignumber.js';
import { Account } from 'account/types';

const HYDRATION_WS_URL = 'wss://rpc.hydradx.cloud';

const DOT_HYDRATION_ID = 5;
const UNQ_HYDRATION_ID = 25;
const USDT_HYDRATION_ID = 10;

const DOT_DECIMALS = 10;
const UNQ_DECIMALS = 18;
const USDT_DECIMALS = 6;

interface HydrationBalancesResult {
  dotBalance: string;
  dotBalanceRaw: string;
  unqBalance: string;
  unqBalanceRaw: string;
  usdtBalance: string;
  usdtBalanceRaw: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useHydrationBalances = (account: Account | undefined): HydrationBalancesResult => {
  const [balances, setBalances] = useState({
    dotBalance: '0',
    dotBalanceRaw: '0',
    unqBalance: '0',
    unqBalanceRaw: '0',
    usdtBalance: '0',
    usdtBalanceRaw: '0',
    isLoading: false,
    error: null as string | null,
  });

  const fetchBalances = useCallback(async () => {
    if (!account) {
      setBalances({
        dotBalance: '0',
        dotBalanceRaw: '0',
        unqBalance: '0',
        unqBalanceRaw: '0',
        usdtBalance: '0',
        usdtBalanceRaw: '0',
        isLoading: false,
        error: null,
      });
      return;
    }

    setBalances(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('Connecting to Hydration...');
      const hydrationProvider = new WsProvider(HYDRATION_WS_URL);
      const hydrationApi = await ApiPromise.create({ provider: hydrationProvider });

      console.log('Fetching Hydration balances for:', account.address);
      
      // Fetch DOT balance
      let dotBalance = '0';
      let dotBalanceRaw = '0';
      try {
        const dotBalanceQuery = await hydrationApi.query.tokens.accounts(
          account.address,
          DOT_HYDRATION_ID
        ) as any;

        if (dotBalanceQuery && dotBalanceQuery.free) {
          dotBalanceRaw = dotBalanceQuery.free.toString();
          const rawBalance = new BigNumber(dotBalanceRaw);
          const divisor = new BigNumber(10).pow(DOT_DECIMALS);
          dotBalance = rawBalance.dividedBy(divisor).toFixed(4);

          console.log('Hydration DOT balance:', {
            raw: dotBalanceRaw,
            formatted: dotBalance,
          });
        }
      } catch (error) {
        console.error('Error getting DOT balance on Hydration:', error);
      }

      // Fetch UNQ balance
      let unqBalance = '0';
      let unqBalanceRaw = '0';
      try {
        const unqBalanceQuery = await hydrationApi.query.tokens.accounts(
          account.address,
          UNQ_HYDRATION_ID
        ) as any;

        if (unqBalanceQuery && unqBalanceQuery.free) {
          unqBalanceRaw = unqBalanceQuery.free.toString();
          const rawBalance = new BigNumber(unqBalanceRaw);
          const divisor = new BigNumber(10).pow(UNQ_DECIMALS);
          unqBalance = rawBalance.dividedBy(divisor).toFixed(4);

          console.log('Hydration UNQ balance:', {
            raw: unqBalanceRaw,
            formatted: unqBalance,
          });
        }
      } catch (error) {
        console.error('Error getting UNQ balance on Hydration:', error);
      }

      // Fetch USDT balance
      let usdtBalance = '0';
      let usdtBalanceRaw = '0';
      try {
        const usdtBalanceQuery = await hydrationApi.query.tokens.accounts(
          account.address,
          USDT_HYDRATION_ID
        ) as any;

        if (usdtBalanceQuery && usdtBalanceQuery.free) {
          usdtBalanceRaw = usdtBalanceQuery.free.toString();
          const rawBalance = new BigNumber(usdtBalanceRaw);
          const divisor = new BigNumber(10).pow(USDT_DECIMALS);
          usdtBalance = rawBalance.dividedBy(divisor).toFixed(4);

          console.log('Hydration USDT balance:', {
            raw: usdtBalanceRaw,
            formatted: usdtBalance,
          });
        }
      } catch (error) {
        console.error('Error getting USDT balance on Hydration:', error);
      }

      await hydrationApi.disconnect();

      setBalances({
        dotBalance,
        dotBalanceRaw,
        unqBalance,
        unqBalanceRaw,
        usdtBalance,
        usdtBalanceRaw,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching Hydration balances:', error);
      setBalances({
        dotBalance: '0',
        dotBalanceRaw: '0',
        unqBalance: '0',
        unqBalanceRaw: '0',
        usdtBalance: '0',
        usdtBalanceRaw: '0',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Hydration balances',
      });
    }
  }, [account]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    dotBalance: balances.dotBalance,
    dotBalanceRaw: balances.dotBalanceRaw,
    unqBalance: balances.unqBalance,
    unqBalanceRaw: balances.unqBalanceRaw,
    usdtBalance: balances.usdtBalance,
    usdtBalanceRaw: balances.usdtBalanceRaw,
    isLoading: balances.isLoading,
    error: balances.error,
    refetch: fetchBalances,
  };
};