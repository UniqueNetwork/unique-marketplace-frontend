import React, { FC, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Modal, Button } from 'components/UI';
import { useAccounts } from 'hooks/useAccounts';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import BigNumber from 'bignumber.js';

// Constants
const UNIQUE_CHAIN_ID = 2037;
const ASSETHUB_CHAIN_ID = 1000;
const HYDRATION_CHAIN_ID = 2034;
const ASSET_HUB_PALLET_ASSETS = 50;
const USDT_ASSET_ID = 1984;
const WUD_ASSET_ID = 31337;
const MIN_BALANCE_AFTER_TRANSFER_DOT_RELAY = 1.1; // Existential Deposit for Relay Chain
const HYDRATION_NON_SOLO_FEE = 0.35; // USDT fee for WUD multi-hop transfers

const formatNumber = (num: number, decimals?: number): string => {
  // Format number with thousand separators
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? (num % 1 === 0 ? 0 : 4)
  });
};

// Types
interface TokenConfig {
  decimals: number;
  uniqueCollectionId?: number;
  assetHubAssetId?: number;
  hydrationCurrencyId?: number;
  minTransfer: number;
  maxTransfer: number;
}

type ChainType = keyof typeof CHAINS;
type Status = 'idle' | 'pending' | 'success' | 'error';

interface Props {
  isVisible: boolean;
  onFinish: () => void;
  tokenSymbol: string;
  sourceChain: ChainType;
  destinationChain: ChainType;
  sourceBalance: string;
  sourceUSDTBalance?: string; // USDT balance on source chain for fee payment
  testid?: string;
}

interface FeeInfo {
  feeAsset: string;
  feeAmount: number;
}

// Token and chain configurations
const TOKENS: Record<string, TokenConfig> = {
  DOT: { 
    decimals: 10, 
    uniqueCollectionId: 437,
    hydrationCurrencyId: 5,
    minTransfer: 0.01, 
    maxTransfer: 1000 
  },
  UNQ: { 
    decimals: 18, 
    uniqueCollectionId: 0,
    hydrationCurrencyId: 25,
    minTransfer: 0.01, 
    maxTransfer: 1000000 
  },
  WUD: { 
    decimals: 10, 
    uniqueCollectionId: 3779,
    assetHubAssetId: 31337,
    hydrationCurrencyId: 1000085,
    minTransfer: 1000, 
    maxTransfer: 10000000000
  },
  USDT: { 
    decimals: 6, 
    uniqueCollectionId: 473,
    assetHubAssetId: 1984,
    hydrationCurrencyId: 10,
    minTransfer: 0.01, 
    maxTransfer: 100000 
  }
};

const CHAINS = {
  unique: { name: 'Unique Network', rpc: 'wss://ws.unique.network', explorer: 'https://unique.subscan.io' },
  relay: { name: 'Polkadot Relay', rpc: 'wss://rpc.polkadot.io', explorer: 'https://polkadot.subscan.io' },
  assetHub: { name: 'Asset Hub', rpc: 'wss://polkadot-asset-hub-rpc.polkadot.io', explorer: 'https://assethub-polkadot.subscan.io' },
  hydration: { name: 'Hydration', rpc: 'wss://rpc.hydradx.cloud', explorer: 'https://hydration.subscan.io' }
};

// Determine fee currency and amount for different routes
const getFeeAssetInfo = (
  source: ChainType,
  destination: ChainType,
  token: string
): FeeInfo | null => {
  // WUD transfers always use USDT for fees
  if (token === 'WUD') {
    if (source === 'hydration' && destination === 'unique') {
      return { feeAsset: 'USDT', feeAmount: HYDRATION_NON_SOLO_FEE };
    }
    if (source === 'unique' && destination === 'hydration') {
      return { feeAsset: 'USDT', feeAmount: HYDRATION_NON_SOLO_FEE };
    }
    if (source === 'unique' && destination === 'assetHub') {
      return { feeAsset: 'USDT', feeAmount: 0.20 };
    }
    if (source === 'hydration' && destination === 'assetHub') {
      return { feeAsset: 'USDT', feeAmount: 0.05 };
    }
  }

  // USDT transfers use USDT for fees
  if (token === 'USDT') {
    if (source === 'hydration' && destination === 'unique') {
      return { feeAsset: 'USDT', feeAmount: 0.05 };
    }
    if (source === 'unique' && destination === 'hydration') {
      return { feeAsset: 'USDT', feeAmount: 0.12 };
    }
    if (source === 'hydration' && destination === 'assetHub') {
      return { feeAsset: 'USDT', feeAmount: 0.05 };
    }
    if (source === 'unique' && destination === 'assetHub') {
      return { feeAsset: 'USDT', feeAmount: 0.05 };
    }
  }

  // Native tokens don't have explicit XCM fees in our setup
  return null;
};

// Transaction builder class for cleaner code organization
class TransactionBuilder {
  private api: ApiPromise;
  
  constructor(api: ApiPromise) {
    this.api = api;
  }

  private createAssetLocation(assetId: number, amountRaw: string) {
    return {
      V4: {
        id: {
          parents: 1,
          interior: {
            X3: [
              { Parachain: ASSETHUB_CHAIN_ID },
              { PalletInstance: ASSET_HUB_PALLET_ASSETS },
              { GeneralIndex: assetId }
            ]
          }
        },
        fun: { Fungible: amountRaw }
      }
    };
  }

  private createDestination(parachainId: number, accountId: Uint8Array) {
    return {
      V4: {
        parents: 1,
        interior: {
          X2: [
            { Parachain: parachainId },
            { AccountId32: { network: null, id: accountId } }
          ]
        }
      }
    };
  }

  private calculateFee(baseFee: number, decimals: number): string {
    return new BigNumber(baseFee)
      .multipliedBy(new BigNumber(10).pow(decimals))
      .integerValue(BigNumber.ROUND_DOWN)
      .toString(10);
  }

  // HYDRATION SOURCE ROUTES
  hydrationToAssetHub(token: string, amountRaw: string, accountId: Uint8Array) {
    const assetId = token === 'USDT' ? USDT_ASSET_ID : WUD_ASSET_ID;
    const tokenConfig = TOKENS[token];
    
    const assetLocation = this.createAssetLocation(assetId, amountRaw);
    const feeAsset = this.createAssetLocation(assetId, this.calculateFee(0.05, tokenConfig.decimals));
    const destination = this.createDestination(ASSETHUB_CHAIN_ID, accountId);
    
    return this.api.tx.xTokens.transferMultiassetWithFee(assetLocation, feeAsset, destination, 'Unlimited');
  }

  hydrationToUnique(token: string, amountRaw: string, accountId: Uint8Array) {
    const assetId = token === 'USDT' ? USDT_ASSET_ID : WUD_ASSET_ID;
    const baseFee = token === 'WUD' ? HYDRATION_NON_SOLO_FEE : 0.05;
    
    const assetLocation = this.createAssetLocation(assetId, amountRaw);
    const feeAsset = this.createAssetLocation(USDT_ASSET_ID, this.calculateFee(baseFee, 6));
    const destination = this.createDestination(UNIQUE_CHAIN_ID, accountId);
    
    return this.api.tx.xTokens.transferMultiassetWithFee(assetLocation, feeAsset, destination, 'Unlimited');
  }

  hydrationToParachainNative(destinationChain: ChainType, currencyId: number, amountRaw: string, accountId: Uint8Array) {
    const destParachain = destinationChain === 'unique' ? UNIQUE_CHAIN_ID : ASSETHUB_CHAIN_ID;
    const destination = this.createDestination(destParachain, accountId);
    
    return this.api.tx.xTokens.transfer(currencyId, amountRaw, destination, 'Unlimited');
  }

  // UNIQUE SOURCE ROUTES
  uniqueToHydration(token: string, amountRaw: string, accountId: Uint8Array) {
    const assetId = token === 'USDT' ? USDT_ASSET_ID : WUD_ASSET_ID;
    const baseFee = token === 'WUD' ? HYDRATION_NON_SOLO_FEE : 0.12;
    
    const assetLocation = this.createAssetLocation(assetId, amountRaw);
    const feeAsset = this.createAssetLocation(USDT_ASSET_ID, this.calculateFee(baseFee, 6));
    const destination = this.createDestination(HYDRATION_CHAIN_ID, accountId);
    
    return this.api.tx.xTokens.transferMultiassetWithFee(assetLocation, feeAsset, destination, 'Unlimited');
  }

  uniqueToAssetHubUSDT(amountRaw: string, accountId: Uint8Array) {
    const assetLocation = this.createAssetLocation(USDT_ASSET_ID, amountRaw);
    const feeAsset = this.createAssetLocation(USDT_ASSET_ID, this.calculateFee(0.05, 6));
    const destination = this.createDestination(ASSETHUB_CHAIN_ID, accountId);
    
    return this.api.tx.xTokens.transferMultiassetWithFee(assetLocation, feeAsset, destination, 'Unlimited');
  }

  uniqueToAssetHubWUD(amountRaw: string, accountId: Uint8Array) {
    const assetLocation = this.createAssetLocation(WUD_ASSET_ID, amountRaw);
    const feeAsset = this.createAssetLocation(USDT_ASSET_ID, this.calculateFee(0.20, 6));
    const destination = this.createDestination(ASSETHUB_CHAIN_ID, accountId);
    
    return this.api.tx.xTokens.transferMultiassetWithFee(assetLocation, feeAsset, destination, 'Unlimited');
  }

  uniqueToRelayDOT(collectionId: number, amountRaw: string, accountId: Uint8Array) {
    const destination = {
      V4: {
        parents: 1,
        interior: { X1: [{ AccountId32: { id: accountId } }] }
      }
    };
    
    return this.api.tx.xTokens.transfer(collectionId, amountRaw, destination, 'Unlimited');
  }

  uniqueToParachainNative(destinationChain: ChainType, collectionId: number, amountRaw: string, accountId: Uint8Array) {
    const destParachain = destinationChain === 'hydration' ? HYDRATION_CHAIN_ID : ASSETHUB_CHAIN_ID;
    const destination = this.createDestination(destParachain, accountId);
    
    return this.api.tx.xTokens.transfer(collectionId, amountRaw, destination, 'Unlimited');
  }

  // RELAY SOURCE ROUTES
  relayToUniqueDOT(amountRaw: string, accountId: Uint8Array) {
    const destination = {
      V4: {
        parents: 0,
        interior: { X1: [{ Parachain: UNIQUE_CHAIN_ID }] }
      }
    };
    
    const beneficiary = {
      V4: {
        parents: 0,
        interior: { X1: [{ AccountId32: { id: accountId } }] }
      }
    };
    
    const assets = {
      V4: [{
        id: { parents: 0, interior: 'Here' },
        fun: { Fungible: amountRaw }
      }]
    };
    
    return this.api.tx.xcmPallet.limitedReserveTransferAssets(
      destination,
      beneficiary,
      assets,
      0,
      { Limited: { refTime: "5000000000", proofSize: "200000" } }
    );
  }

  assetHubToParachain(
    destinationChain: ChainType,
    token: string,
    assetId: number,
    amountRaw: string,
    accountId: Uint8Array
  ) {
    const destParachain = destinationChain === 'unique' ? UNIQUE_CHAIN_ID : HYDRATION_CHAIN_ID;

    const dest = {
      V4: {
        parents: 1,
        interior: { X1: [{ Parachain: destParachain }] }
      }
    };

    const feeAssetId = {
      V4: {
        parents: 0,
        interior: {
          X2: [
            { PalletInstance: ASSET_HUB_PALLET_ASSETS },
            { GeneralIndex: assetId }
          ]
        }
      }
    };
    
    const assets = {
      V4: [
        {
          id: { ...feeAssetId.V4 },
          fun: { Fungible: amountRaw }
        }
      ]
    };

    const customXcmOnDest = {
      V4: [
        {
          DepositAsset: {
            assets: { Wild: 'All' },
            beneficiary: {
              parents: 0,
              interior: {
                X1: [{ AccountId32: { id: accountId } }]
              }
            }
          }
        }
      ]
    };

    return this.api.tx.polkadotXcm.transferAssetsUsingTypeAndThen(
      dest,
      assets,
      'LocalReserve',
      feeAssetId,
      'LocalReserve',
      customXcmOnDest,
      { Limited: { refTime: "5000000000", proofSize: "200000" } }
    );
  }
}

// Main routing function with clear conditions
function buildTransaction(
  api: ApiPromise,
  source: ChainType,
  destination: ChainType,
  token: string,
  amountRaw: string,
  accountId: Uint8Array,
  tokenConfig: TokenConfig
) {
  const builder = new TransactionBuilder(api);

  // ROUTE: Hydration → AssetHub (USDT/WUD)
  if (source === 'hydration' && destination === 'assetHub' && (token === 'USDT' || token === 'WUD')) {
    return builder.hydrationToAssetHub(token, amountRaw, accountId);
  }

  // ROUTE: Hydration → Unique (USDT/WUD)
  if (source === 'hydration' && destination === 'unique' && (token === 'USDT' || token === 'WUD')) {
    return builder.hydrationToUnique(token, amountRaw, accountId);
  }

  // ROUTE: Hydration → Any (DOT/UNQ native tokens)
  if (source === 'hydration' && (token === 'DOT' || token === 'UNQ') && tokenConfig.hydrationCurrencyId) {
    return builder.hydrationToParachainNative(destination, tokenConfig.hydrationCurrencyId, amountRaw, accountId);
  }

  // ROUTE: Unique → Hydration (USDT/WUD)
  if (source === 'unique' && destination === 'hydration' && (token === 'USDT' || token === 'WUD')) {
    return builder.uniqueToHydration(token, amountRaw, accountId);
  }

  // ROUTE: Unique → AssetHub (USDT)
  if (source === 'unique' && destination === 'assetHub' && token === 'USDT') {
    return builder.uniqueToAssetHubUSDT(amountRaw, accountId);
  }

  // ROUTE: Unique → AssetHub (WUD)
  if (source === 'unique' && destination === 'assetHub' && token === 'WUD') {
    return builder.uniqueToAssetHubWUD(amountRaw, accountId);
  }

  // BLOCKED: Unique ↔ Relay routes are not supported

  // ROUTE: Unique → Any (DOT/UNQ native tokens)
  if (source === 'unique' && (token === 'DOT' || token === 'UNQ') && tokenConfig.uniqueCollectionId !== undefined) {
    return builder.uniqueToParachainNative(destination, tokenConfig.uniqueCollectionId, amountRaw, accountId);
  }

  // BLOCKED: Unique ↔ Relay routes are not supported

  // ROUTE: AssetHub → Any (USDT/WUD)
  if (source === 'assetHub' && (token === 'USDT' || token === 'WUD') && tokenConfig.assetHubAssetId) {
    return builder.assetHubToParachain(destination, token, tokenConfig.assetHubAssetId, amountRaw, accountId);
  }


  throw new Error(`Unsupported transfer route: ${source} → ${destination} for ${token}`);
}

// Validation function with proper fee asset and existential deposit checking
function validateAmountAndBalances(
  amountNum: number,
  sourceBalance: string,
  sourceUSDTBalance: string | undefined,
  source: ChainType,
  destination: ChainType,
  tokenSymbol: string,
  token: TokenConfig
) {
  // Block deprecated Unique ↔ Relay transfers
  if ((source === 'unique' && destination === 'relay') || (source === 'relay' && destination === 'unique')) {
    throw new Error('Transfers between Unique and Polkadot Relay are not supported');
  }
  const balanceNum = parseFloat(sourceBalance.replace(/[,\s]/g, ''));
  
  // Basic validations
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Error('Please enter a valid amount');
  }
  
  if (amountNum < token.minTransfer) {
    throw new Error(`Minimum transfer: ${formatNumber(token.minTransfer)} ${tokenSymbol}`);
  }
  
  if (amountNum > token.maxTransfer) {
    throw new Error(`Maximum transfer: ${formatNumber(token.maxTransfer)} ${tokenSymbol}`);
  }

  // Check Existential Deposit for DOT on Relay Chain
  const isRelayDotTransfer = source === 'relay' && tokenSymbol === 'DOT' && destination === 'unique';
  const relayMinBalance = isRelayDotTransfer ? MIN_BALANCE_AFTER_TRANSFER_DOT_RELAY : 0;
  
  // Get fee information
  const feeInfo = getFeeAssetInfo(source, destination, tokenSymbol);
  
  if (feeInfo) {
    const { feeAsset, feeAmount } = feeInfo;
    
    // Check if fee is paid in different asset (WUD transfers use USDT for fees)
    if (feeAsset === 'USDT' && tokenSymbol !== 'USDT') {
      // WUD transfer - fee paid in USDT
      if (!sourceUSDTBalance) {
        throw new Error(`USDT balance not available. Need ${formatNumber(feeAmount, 2)} USDT for transaction fee`);
      }
      
      const usdtBalanceNum = parseFloat(sourceUSDTBalance.replace(/[,\s]/g, ''));
      if (feeAmount > usdtBalanceNum) {
        throw new Error(
          `Insufficient USDT balance for fee. Need ${formatNumber(feeAmount, 2)} USDT, ` +
          `available: ${sourceUSDTBalance} USDT on ${CHAINS[source].name}`
        );
      }
      
      // Check main token balance
      const totalNeeded = amountNum + relayMinBalance;
      if (totalNeeded > balanceNum) {
        throw new Error(
          `Insufficient ${tokenSymbol} balance. Need ${formatNumber(totalNeeded)} ${tokenSymbol}, ` +
          `available: ${sourceBalance} ${tokenSymbol}`
        );
      }
    } else {
      // Fee paid in same asset (USDT transfers or native tokens)
      const totalNeeded = amountNum + feeAmount + relayMinBalance;
      if (totalNeeded > balanceNum) {
        if (isRelayDotTransfer) {
          throw new Error(
            `Insufficient balance. Need to keep at least ${formatNumber(relayMinBalance, 1)} DOT on Relay Chain for Existential Deposit. ` +
            `Maximum transfer: ${formatNumber(balanceNum - relayMinBalance)} DOT`
          );
        }
        throw new Error(
          `Insufficient balance. Need ${formatNumber(totalNeeded)} ${tokenSymbol} ` +
          `(${formatNumber(amountNum)} transfer + ${formatNumber(feeAmount)} fee), available: ${sourceBalance} ${tokenSymbol}`
        );
      }
    }
  } else {
    // No XCM fee but check for Existential Deposit
    const totalNeeded = amountNum + relayMinBalance;
    if (totalNeeded > balanceNum) {
      if (isRelayDotTransfer) {
        throw new Error(
          `Insufficient balance. Need to keep at least ${formatNumber(relayMinBalance, 1)} DOT on Relay Chain for Existential Deposit. ` +
          `Maximum transfer: ${formatNumber(balanceNum - relayMinBalance)} DOT`
        );
      }
      throw new Error(
        `Insufficient ${tokenSymbol} balance. Available: ${sourceBalance} ${tokenSymbol}`
      );
    }
  }
}

// Main Component
export const UniversalCrossChainTransferModal: FC<Props> = ({
  isVisible,
  onFinish,
  tokenSymbol,
  sourceChain,
  destinationChain,
  sourceBalance,
  sourceUSDTBalance,
  testid = 'universal-cross-chain-modal'
}) => {
  const { selectedAccount } = useAccounts();
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [txHash, setTxHash] = useState('');
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [connecting, setConnecting] = useState(false);

  const token = TOKENS[tokenSymbol] || { decimals: 10, minTransfer: 0.001, maxTransfer: 1000000 };
  const fromChain = CHAINS[sourceChain];
  const toChain = CHAINS[destinationChain];

  // Connect to blockchain
  useEffect(() => {
    if (!isVisible || !fromChain) return;

    setConnecting(true);
    const provider = new WsProvider(fromChain.rpc);
    let apiInstance: ApiPromise | null = null;
    
    ApiPromise.create({ provider })
      .then(createdApi => {
        apiInstance = createdApi;
        setApi(createdApi);
        setConnecting(false);
      })
      .catch(err => {
        console.error('API connection failed:', err);
        setMessage('Failed to connect to blockchain');
        setConnecting(false);
      });
      
    return () => { 
      if (apiInstance) {
        apiInstance.disconnect(); 
      }
    };
  }, [isVisible, fromChain]);

  const handleClose = useCallback(() => {
    setAmount('');
    setStatus('idle');
    setMessage('');
    setTxHash('');
    if (api) api.disconnect();
    onFinish();
  }, [api, onFinish]);

  const isSameAddress = (addr1: string, addr2: string): boolean => {
    try {
      const pub1 = decodeAddress(addr1);
      const pub2 = decodeAddress(addr2);
      return Buffer.from(pub1).equals(Buffer.from(pub2));
    } catch {
      return false;
    }
  };

  const getInjectorForAccount = async (address: string) => {
    const extensions = await web3Enable('Cross-chain Transfer');
    if (!extensions.length) {
      throw new Error('No wallet extension found');
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    const allAccounts = await web3Accounts();
    const matchingAccount = allAccounts.find(acc => isSameAddress(acc.address, address));
    
    if (!matchingAccount) {
      throw new Error('Account not found in wallet. Please make sure the account is imported in your extension.');
    }
    
    const injector = await web3FromSource(matchingAccount.meta.source);
    if (!injector?.signer) {
      throw new Error(`Extension ${matchingAccount.meta.source} has no signer`);
    }

    return { injector, account: matchingAccount };
  };

  const executeTransfer = async () => {
    if (!selectedAccount?.address || !amount || !api) {
      setStatus('error');
      setMessage('Missing required data');
      return;
    }

    setStatus('pending');
    setMessage('Initializing...');

    try {
      const amountNum = parseFloat(amount);
      
      // Validate amount and balances
      validateAmountAndBalances(
        amountNum,
        sourceBalance,
        sourceUSDTBalance,
        sourceChain,
        destinationChain,
        tokenSymbol,
        token
      );

      // Convert to raw amount
      const amountRaw = new BigNumber(amount)
        .multipliedBy(new BigNumber(10).pow(token.decimals))
        .integerValue(BigNumber.ROUND_DOWN)
        .toString(10);
      
      const accountId = decodeAddress(selectedAccount.address);
      
      setMessage('Creating transaction...');
      
      // Build transaction
      const tx = buildTransaction(
        api,
        sourceChain,
        destinationChain,
        tokenSymbol,
        amountRaw,
        accountId,
        token
      );

      if (!tx) {
        throw new Error('Failed to create transaction');
      }

      console.log('Transaction created:', {
        section: tx.method.section,
        method: tx.method.method,
        hash: tx.hash.toHex()
      });

      setMessage('Connecting to wallet...');
      const { injector, account } = await getInjectorForAccount(selectedAccount.address);

      setMessage('Requesting signature...');
      const nonce = await api.rpc.system.accountNextIndex(account.address);
      
      const signedPayload = await tx.signAsync(account.address, { 
        signer: injector.signer,
        nonce: nonce
      });
      
      setMessage('Broadcasting transaction...');
      
      await signedPayload.send((result) => {
        console.log('Transaction status:', result.status.type);
        
        if (result.status.isInBlock) {
          const success = result.events.some(({ event }) => 
            event.section === 'system' && event.method === 'ExtrinsicSuccess'
          );
          
          const failed = result.events.some(({ event }) => 
            (event.section === 'xTokens' && event.method === 'XcmExecutionFailed') ||
            (event.section === 'polkadotXcm' && event.method === 'LocalExecutionIncomplete')
          );
          
          if (success && !failed) {
            setStatus('success');
            setMessage(`Successfully transferred ${formatNumber(parseFloat(amount))} ${tokenSymbol}`);
            setTxHash(result.txHash.toString());
            setTimeout(handleClose, 9000);
          } else {
            setStatus('error');
            setMessage('Transaction execution failed on blockchain');
            setTxHash(result.txHash.toString());
          }
        } else if (result.isError) {
          setStatus('error');
          setMessage('Transaction error occurred');
        }
      });

    } catch (error: any) {
      console.error('Transfer error:', error);
      setStatus('error');
      
      if (error.message?.includes('Cancelled') || error.message?.includes('cancelled')) {
        setMessage('Transaction cancelled by user');
      } else if (error.message?.includes('1010')) {
        setMessage('Insufficient balance for transaction fee');
      } else {
        setMessage(error.message || 'Transfer failed. Please try again');
      }
    }
  };

  // Calculate fee information for UI display
  const getFeeDisplay = () => {
    const feeInfo = getFeeAssetInfo(sourceChain, destinationChain, tokenSymbol);
    const amountNum = parseFloat(amount || '0');
    const balanceNum = parseFloat(sourceBalance.replace(/[,\s]/g, ''));
    const usdtBalanceNum = sourceUSDTBalance ? parseFloat(sourceUSDTBalance.replace(/[,\s]/g, '')) : 0;
    
    // Check for Relay DOT Existential Deposit
    const isRelayDotTransfer = sourceChain === 'relay' && tokenSymbol === 'DOT' && destinationChain === 'unique';
    const relayMinBalance = isRelayDotTransfer ? MIN_BALANCE_AFTER_TRANSFER_DOT_RELAY : 0;
    
    let isValid = false;
    let errorMessage = '';
    
    // Basic validation
    if (amountNum <= 0) {
      isValid = false;
      errorMessage = '';
    } else if (amountNum < token.minTransfer) {
      isValid = false;
      errorMessage = `Minimum transfer: ${formatNumber(token.minTransfer)} ${tokenSymbol}`;
    } else if (amountNum > token.maxTransfer) {
      isValid = false;
      errorMessage = `Maximum transfer: ${formatNumber(token.maxTransfer)} ${tokenSymbol}`;
    } else if (isRelayDotTransfer && amountNum + relayMinBalance > balanceNum) {
      // Special check for Relay DOT
      isValid = false;
      const maxTransfer = Math.max(0, balanceNum - relayMinBalance);
      errorMessage = `Must keep ${formatNumber(relayMinBalance, 1)} DOT on Relay Chain (Existential Deposit). Maximum transfer: ${formatNumber(maxTransfer)} DOT`;
    } else if (feeInfo) {
      const { feeAsset, feeAmount } = feeInfo;
      const needsSeparateFeeAsset = feeAsset === 'USDT' && tokenSymbol !== 'USDT';
      
      if (needsSeparateFeeAsset) {
        // WUD transfers - check both balances separately
        if (amountNum > balanceNum) {
          isValid = false;
          errorMessage = `Insufficient ${tokenSymbol} balance. Available: ${sourceBalance} ${tokenSymbol}`;
        } else if (!sourceUSDTBalance || usdtBalanceNum < feeAmount) {
          isValid = false;
          errorMessage = sourceUSDTBalance 
            ? `Insufficient USDT for fee. Need ${feeAmount.toFixed(2)} USDT, available: ${sourceUSDTBalance} USDT`
            : `USDT balance required for fee. Need ${feeAmount.toFixed(2)} USDT`;
        } else {
          isValid = true;
        }
      } else {
        // Same asset for amount and fee
        const totalNeeded = amountNum + feeAmount + relayMinBalance;
        if (totalNeeded > balanceNum) {
          isValid = false;
          errorMessage = `Insufficient balance. Need ${formatNumber(totalNeeded)} ${tokenSymbol}, available: ${sourceBalance} ${tokenSymbol}`;
        } else {
          isValid = true;
        }
      }
    } else {
      // No fee but still check balance
      const totalNeeded = amountNum + relayMinBalance;
      if (totalNeeded > balanceNum) {
        isValid = false;
        errorMessage = `Insufficient balance. Available: ${sourceBalance} ${tokenSymbol}`;
      } else {
        isValid = true;
      }
    }
    
    return { 
      feeInfo, 
      needsSeparateFeeAsset: feeInfo?.feeAsset === 'USDT' && tokenSymbol !== 'USDT', 
      isValid, 
      errorMessage, 
      isRelayDotTransfer, 
      relayMinBalance 
    };
  };

  const { feeInfo, needsSeparateFeeAsset, isValid, errorMessage, isRelayDotTransfer, relayMinBalance } = getFeeDisplay();
  const amountNum = parseFloat(amount || '0');

  if (!isVisible) return null;

  return (
    <Modal isVisible={isVisible} isClosable onClose={handleClose}>
      <Content data-testid={testid}>
        <Header>
          <Title>{tokenSymbol} Transfer</Title>
          <Subtitle>{fromChain.name} → {toChain.name}</Subtitle>
        </Header>

        {connecting ? (
          <Loading>Connecting to blockchain...</Loading>
        ) : (
          <Body>
            <Group>
              <Label>Amount ({tokenSymbol})</Label>
              <Input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min: ${formatNumber(token.minTransfer)}`}
                disabled={status === 'pending'}
              />
              <Info>
                <span>Min: {formatNumber(token.minTransfer)} {tokenSymbol}</span>
                <span>Available: {sourceBalance} {tokenSymbol}</span>
              </Info>
              
              {/* Existential Deposit display for Relay DOT */}
              {isRelayDotTransfer && amount && amountNum > 0 && (
                <FeeBreakdown>
                  <FeeRow>
                    <span>Amount to transfer:</span>
                    <span>{formatNumber(amountNum, 4)} DOT</span>
                  </FeeRow>
                  <FeeRow>
                    <span>Existential Deposit (must remain):</span>
                    <span>{formatNumber(relayMinBalance, 1)} DOT</span>
                  </FeeRow>
                  <FeeDivider />
                  <FeeRow $bold>
                    <span>Total required on Relay:</span>
                    <span>{formatNumber(amountNum + relayMinBalance, 4)} DOT</span>
                  </FeeRow>
                  <FeeRow>
                    <span>Available on Relay:</span>
                    <span>{sourceBalance} DOT</span>
                  </FeeRow>
                  <FeeNote>
                    Polkadot Relay Chain requires minimum {formatNumber(relayMinBalance, 1)} DOT balance to keep account active
                  </FeeNote>
                </FeeBreakdown>
              )}
              
              {/* Fee breakdown for transfers with XCM fees */}
              {feeInfo && amount && amountNum > 0 && !isRelayDotTransfer && (
                <FeeBreakdown>
                  <FeeRow>
                    <span>Amount to send:</span>
                    <span>{formatNumber(amountNum, tokenSymbol === 'USDT' ? 2 : 4)} {tokenSymbol}</span>
                  </FeeRow>
                  
                  {needsSeparateFeeAsset ? (
                    <>
                      <FeeRow>
                        <span>XCM execution fee:</span>
                        <span>{formatNumber(feeInfo.feeAmount, 2)} USDT</span>
                      </FeeRow>
                      <FeeDivider />
                      <FeeRow>
                        <span>Required {tokenSymbol} balance:</span>
                        <span>{formatNumber(amountNum, 4)} {tokenSymbol}</span>
                      </FeeRow>
                      <FeeRow>
                        <span>Required USDT balance (for fee):</span>
                        <span>{formatNumber(feeInfo.feeAmount, 2)} USDT</span>
                      </FeeRow>
                      {sourceUSDTBalance && (
                        <FeeRow $success={parseFloat(sourceUSDTBalance.replace(/[,\s]/g, '')) >= feeInfo.feeAmount}>
                          <span>Available USDT on {fromChain.name}:</span>
                          <span>{sourceUSDTBalance} USDT {parseFloat(sourceUSDTBalance.replace(/[,\s]/g, '')) >= feeInfo.feeAmount ? '✓' : ''}</span>
                        </FeeRow>
                      )}
                    </>
                  ) : (
                    <>
                      <FeeRow>
                        <span>XCM execution fee:</span>
                        <span>{formatNumber(feeInfo.feeAmount, tokenSymbol === 'USDT' ? 2 : 4)} {tokenSymbol}</span>
                      </FeeRow>
                      <FeeDivider />
                      <FeeRow $bold>
                        <span>Total required:</span>
                        <span>{formatNumber(amountNum + feeInfo.feeAmount, tokenSymbol === 'USDT' ? 2 : 4)} {tokenSymbol}</span>
                      </FeeRow>
                    </>
                  )}
                  
                  <FeeNote>
                    Fee covers XCM execution costs across chains
                  </FeeNote>
                </FeeBreakdown>
              )}
              
              {/* Error display */}
              {amount && !isValid && amountNum > 0 && errorMessage && (
                <Warning>{errorMessage}</Warning>
              )}
            </Group>

            {status !== 'idle' && (
              <StatusBox $status={status}>
                <p>{message}</p>
                {txHash && (
                  <Link 
                    href={`${fromChain.explorer}/extrinsic/${txHash}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View transaction →
                  </Link>
                )}
              </StatusBox>
            )}

            <Buttons>
              <Button 
                title="Cancel" 
                onClick={handleClose} 
                disabled={status === 'pending'} 
              />
              <Button
                title={status === 'pending' ? 'Processing...' : 'Transfer'}
                role="primary"
                onClick={executeTransfer}
                disabled={!amount || !isValid || status === 'pending' || !api}
              />
            </Buttons>
          </Body>
        )}
      </Content>
    </Modal>
  );
};

// Styled components
const Content = styled.div`
  width: 100%; 
  max-width: 540px;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 24px; 
  font-weight: 600; 
  margin: 0 0 8px;
`;

const Subtitle = styled.p`
  font-size: 14px; 
  color: #6c757d; 
  margin: 0;
`;

const Body = styled.div`
  display: flex; 
  flex-direction: column; 
  gap: 20px;
`;

const Group = styled.div`
  display: flex; 
  flex-direction: column; 
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px; 
  font-weight: 500;
`;

const Input = styled.input`
  padding: 12px; 
  border: 1px solid #e5e5e5; 
  border-radius: 4px; 
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #009cf0;
  }
  
  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Info = styled.div`
  display: flex; 
  justify-content: space-between; 
  font-size: 12px; 
  color: #6c757d;
`;

const Warning = styled.div`
  font-size: 12px;
  color: #dc3545;
  margin-top: 4px;
  padding: 8px;
  background: #fef2f2;
  border-radius: 4px;
`;

const FeeBreakdown = styled.div`
  background: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
`;

const FeeRow = styled.div<{ $bold?: boolean; $success?: boolean }>`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 6px;
  font-weight: ${p => p.$bold ? '600' : '400'};
  color: ${p => p.$success ? '#28a745' : p.$bold ? '#000' : '#495057'};
  
  &:last-of-type {
    margin-bottom: 0;
  }
`;

const FeeDivider = styled.div`
  height: 1px;
  background: #dee2e6;
  margin: 8px 0;
`;

const FeeNote = styled.div`
  font-size: 11px;
  color: #6c757d;
  margin-top: 8px;
  font-style: italic;
`;

const StatusBox = styled.div<{ $status: Status }>`
  padding: 16px; 
  border-radius: 4px;
  background: ${p => 
    p.$status === 'success' ? '#f0fdf4' : 
    p.$status === 'error' ? '#fef2f2' : 
    '#fefce8'
  };
  border: 1px solid ${p => 
    p.$status === 'success' ? '#bbf7d0' : 
    p.$status === 'error' ? '#fecaca' : 
    '#fef08a'
  };
  
  p { 
    margin: 0 0 8px; 
    font-size: 14px; 
  }
`;

const Link = styled.a`
  font-size: 12px; 
  color: #009cf0; 
  text-decoration: none; 
  
  &:hover { 
    text-decoration: underline; 
  }
`;

const Buttons = styled.div`
  display: flex; 
  gap: 12px; 
  
  button { 
    flex: 1; 
  }
`;

const Loading = styled.div`
  padding: 40px 0; 
  text-align: center; 
  color: #6c757d;
`;