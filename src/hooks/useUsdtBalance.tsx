import { useEffect, useState, useCallback } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import BigNumber from 'bignumber.js';
import { Account } from 'account/types';

const USDT_DECIMALS = 6;
const USDT_COLLECTION_ID = '473'; // USDT collection ID на Unique
const USDT_AH_ASSET_ID = 1984; // USDT asset ID на Asset Hub
const ASSETHUB_WS_URL = 'wss://polkadot-asset-hub-rpc.polkadot.io';

interface UsdtBalanceResult {
  uniqueUsdtBalance: string;
  uniqueUsdtBalanceRaw: string;
  assetHubUsdtBalance: string;
  assetHubUsdtBalanceRaw: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useUsdtBalance = (account: Account | undefined): UsdtBalanceResult => {
  const [balances, setBalances] = useState({
    uniqueUsdtBalance: '0',
    uniqueUsdtBalanceRaw: '0',
    assetHubUsdtBalance: '0',
    assetHubUsdtBalanceRaw: '0',
    isLoading: false,
    error: null as string | null,
  });

  const fetchBalances = useCallback(async () => {
    if (!account) {
      setBalances({
        uniqueUsdtBalance: '0',
        uniqueUsdtBalanceRaw: '0',
        assetHubUsdtBalance: '0',
        assetHubUsdtBalanceRaw: '0',
        isLoading: false,
        error: null,
      });
      return;
    }

    setBalances(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get USDT balance on Unique Network from fungibleBalances
      let uniqueUsdtBalance = '0';
      let uniqueUsdtBalanceRaw = '0';

      if (account.fungibleBalances) {
        console.log('Searching for USDT in fungibleBalances...');
        
        // Ищем по collectionId
        const usdtBalance = account.fungibleBalances.get(USDT_COLLECTION_ID);
        
        console.log('USDT balance object:', usdtBalance);
        
        if (usdtBalance) {
          uniqueUsdtBalance = usdtBalance.amount || '0';
          uniqueUsdtBalanceRaw = usdtBalance.raw || '0';
          console.log('USDT balance on Unique Network:', {
            amount: uniqueUsdtBalance,
            raw: uniqueUsdtBalanceRaw,
            formatted: usdtBalance.formatted,
            decimals: usdtBalance.decimals,
          });
        } else {
          console.warn('USDT balance not found in fungibleBalances for collectionId:', USDT_COLLECTION_ID);

          const usdtBalanceByUnit = Array.from(account.fungibleBalances.values()).find(
            balance => balance.unit === 'USDT'
          );
          
          if (usdtBalanceByUnit) {
            uniqueUsdtBalance = usdtBalanceByUnit.amount || '0';
            uniqueUsdtBalanceRaw = usdtBalanceByUnit.raw || '0';
            console.log('USDT balance found by unit:', uniqueUsdtBalance);
          }
        }
      } else {
        console.warn('No fungibleBalances in account');
      }

      // Fetch USDT balance on Asset Hub
      let assetHubUsdtBalance = '0';
      let assetHubUsdtBalanceRaw = '0';

      try {
        console.log('Connecting to Asset Hub for USDT...');
        const assetHubProvider = new WsProvider(ASSETHUB_WS_URL);
        const assetHubApi = await ApiPromise.create({ provider: assetHubProvider });

        console.log('Fetching Asset Hub USDT balance for:', account.address);
        const assetBalanceQuery = await assetHubApi.query.assets.account(
          USDT_AH_ASSET_ID,
          account.address
        );

        if (assetBalanceQuery.isSome) {
          const balanceData = assetBalanceQuery.unwrap() as any;
          assetHubUsdtBalanceRaw = balanceData.balance.toString();
          
          const rawBalance = new BigNumber(assetHubUsdtBalanceRaw);
          const divisor = new BigNumber(10).pow(USDT_DECIMALS);
          assetHubUsdtBalance = rawBalance.dividedBy(divisor).toFixed(4);

          console.log('Asset Hub USDT balance:', {
            raw: assetHubUsdtBalanceRaw,
            formatted: assetHubUsdtBalance,
          });
        } else {
          console.log('No USDT balance found on Asset Hub');
        }

        await assetHubApi.disconnect();
      } catch (error) {
        console.error('Error getting USDT balance on Asset Hub:', error);
      }

      setBalances({
        uniqueUsdtBalance,
        uniqueUsdtBalanceRaw,
        assetHubUsdtBalance,
        assetHubUsdtBalanceRaw,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching USDT balances:', error);
      setBalances({
        uniqueUsdtBalance: '0',
        uniqueUsdtBalanceRaw: '0',
        assetHubUsdtBalance: '0',
        assetHubUsdtBalanceRaw: '0',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch USDT balances',
      });
    }
  }, [account]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    uniqueUsdtBalance: balances.uniqueUsdtBalance,
    uniqueUsdtBalanceRaw: balances.uniqueUsdtBalanceRaw,
    assetHubUsdtBalance: balances.assetHubUsdtBalance,
    assetHubUsdtBalanceRaw: balances.assetHubUsdtBalanceRaw,
    isLoading: balances.isLoading,
    error: balances.error,
    refetch: fetchBalances,
  };
};