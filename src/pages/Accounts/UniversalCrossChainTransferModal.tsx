import React, { FC, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Modal, Button } from 'components/UI';
import { useAccounts } from 'hooks/useAccounts';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import BigNumber from 'bignumber.js';

const UNIQUE_CHAIN_ID = 2037;
const ASSETHUB_CHAIN_ID = 1000;
const HYDRATION_CHAIN_ID = 2034;
const ASSET_HUB_PALLET_ASSETS = 50;
const USDT_ASSET_ID = 1984;
const WUD_ASSET_ID = 31337;
const MIN_BALANCE_AFTER_TRANSFER_DOT_RELAY = 1.1; // Existential Deposit + buffer for Relay Chain

interface TokenConfig {
  decimals: number;
  uniqueCollectionId?: number;
  assetHubAssetId?: number;
  hydrationCurrencyId?: number;
  minTransfer: number;
  maxTransfer: number;
}

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
    minTransfer: 0.01, 
    maxTransfer: 1000000 
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

type ChainType = keyof typeof CHAINS;
type Status = 'idle' | 'pending' | 'success' | 'error';

interface Props {
  isVisible: boolean;
  onFinish: () => void;
  tokenSymbol: string;
  sourceChain: ChainType;
  destinationChain: ChainType;
  sourceBalance: string;
  testid?: string;
}

export const UniversalCrossChainTransferModal: FC<Props> = ({
  isVisible,
  onFinish,
  tokenSymbol,
  sourceChain,
  destinationChain,
  sourceBalance,
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

  // Compare addresses by public key (works across different SS58 formats)
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
    // Enable extensions
    const extensions = await web3Enable('Cross-chain Transfer');
    if (!extensions.length) {
      throw new Error('No wallet extension found');
    }

    // Wait for extension initialization
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get all accounts from extensions
    const allAccounts = await web3Accounts();

    // Find matching account by public key
    const matchingAccount = allAccounts.find(acc => isSameAddress(acc.address, address));
    
    if (!matchingAccount) {
      console.error('Account not found!');
      throw new Error('Account not found in wallet. Please make sure the account is imported in your extension.');
    }
    // Get injector using web3FromSource (this is the KEY!)
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
      
      console.log('Validating amount:', {
        amount: amountNum,
        min: token.minTransfer,
        max: token.maxTransfer,
        balance: sourceBalance
      });

      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      if (amountNum < token.minTransfer) {
        throw new Error(`Minimum transfer: ${token.minTransfer} ${tokenSymbol}`);
      }
      
      if (amountNum > token.maxTransfer) {
        throw new Error(`Maximum transfer: ${token.maxTransfer} ${tokenSymbol}`);
      }

      const balanceNum = parseFloat(sourceBalance.replace(/[,\s]/g, ''));
      
      // Special requirement for DOT transfers from Relay Chain
      // Must keep at least 1.1 DOT for Existential Deposit + buffer
      const isRelayDotTransfer = sourceChain === 'relay' && tokenSymbol === 'DOT' && destinationChain === 'unique';
      const relayMinBalance = isRelayDotTransfer ? MIN_BALANCE_AFTER_TRANSFER_DOT_RELAY : 0;
      
      // Check if this route needs destination fee
      const needsDestFee = (
        (sourceChain === 'hydration' || sourceChain === 'unique') &&
        (tokenSymbol === 'USDT' || tokenSymbol === 'WUD') &&
        (destinationChain === 'assetHub' || destinationChain === 'unique' || destinationChain === 'hydration')
      );
      
      // Multi-hop transfers have higher execution costs
      const isMultiHop = (
        (sourceChain === 'hydration' && destinationChain === 'unique') ||
        (sourceChain === 'unique' && destinationChain === 'hydration')
      ) && (tokenSymbol === 'USDT' || tokenSymbol === 'WUD');
      
      // Fee is sent as separate asset, NOT added to user amount
      const destFee = needsDestFee ? (isMultiHop ? 0.12 : 0.05) : 0;
      const totalNeeded = amountNum + destFee + relayMinBalance;
      
      if (totalNeeded > balanceNum) {
        if (isRelayDotTransfer) {
          throw new Error(`Insufficient balance. Need ${totalNeeded.toFixed(4)} DOT (${amountNum} transfer + ${relayMinBalance} must remain for Existential Deposit), available: ${sourceBalance} DOT`);
        }
        throw new Error(`Insufficient balance. Need ${totalNeeded.toFixed(tokenSymbol === 'USDT' ? 2 : 4)} ${tokenSymbol} (${amountNum} transfer + ${destFee} fee), available: ${sourceBalance} ${tokenSymbol}`);
      }

      // Convert to raw amount without any formatting
      const amountRaw = new BigNumber(amount)
        .multipliedBy(new BigNumber(10).pow(token.decimals))
        .integerValue(BigNumber.ROUND_DOWN)
        .toString(10);
      
      console.log('Amount conversion:', {
        input: amount,
        decimals: token.decimals,
        raw: amountRaw,
        rawType: typeof amountRaw
      });
      
      const accountId = decodeAddress(selectedAccount.address);
      
      setMessage('Creating transaction...');
      let tx;
      
      // FROM HYDRATION
      if (sourceChain === 'hydration' && token.hydrationCurrencyId !== undefined) {
        if (destinationChain === 'assetHub' && (tokenSymbol === 'USDT' || tokenSymbol === 'WUD')) {
          // Hydration → AssetHub (USDT/WUD returning home)
          const assetId = tokenSymbol === 'USDT' ? USDT_ASSET_ID : WUD_ASSET_ID;
          
          // Asset for user
          const assetLocation = {
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
          
          // Fee for destination
          const feeBuffer = new BigNumber(0.05)
            .multipliedBy(new BigNumber(10).pow(token.decimals))
            .integerValue(BigNumber.ROUND_DOWN)
            .toString(10);
          
          const feeAsset = {
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
              fun: { Fungible: feeBuffer }
            }
          };
          
          const destination = {
            V4: {
              parents: 1,
              interior: {
                X2: [
                  { Parachain: ASSETHUB_CHAIN_ID },
                  { AccountId32: { network: null, id: accountId } }
                ]
              }
            }
          };
          
          tx = api.tx.xTokens.transferMultiassetWithFee(assetLocation, feeAsset, destination, 'Unlimited');
        } else if (destinationChain === 'unique' && (tokenSymbol === 'USDT' || tokenSymbol === 'WUD')) {
          // Hydration → Unique (USDT/WUD via asset location)
          const assetId = tokenSymbol === 'USDT' ? USDT_ASSET_ID : WUD_ASSET_ID;

          // Asset to send - just the user amount
          const assetLocation = {
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
          
          // Fee for XCM execution (will be deducted from amountRaw)
          const feeForExecution = new BigNumber(0.12)
            .multipliedBy(new BigNumber(10).pow(token.decimals))
            .integerValue(BigNumber.ROUND_DOWN)
            .toString(10);
          
          const feeAsset = {
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
              fun: { Fungible: feeForExecution }
            }
          };
          
          const destination = {
            V4: {
              parents: 1,
              interior: {
                X2: [
                  { Parachain: UNIQUE_CHAIN_ID },
                  { AccountId32: { network: null, id: accountId } }
                ]
              }
            }
          };
          
          console.log('Multi-hop transfer:', {
            sending: amount,
            feeWillBeDeducted: '0.12',
            recipientWillReceive: 'approximately ' + (parseFloat(amount) - 0.12)
          });
          
          tx = api.tx.xTokens.transferMultiassetWithFee(assetLocation, feeAsset, destination, 'Unlimited');
        } else {
          // Hydration → Unique/AssetHub (native tokens like DOT, UNQ)
          const destParachain = destinationChain === 'unique' ? UNIQUE_CHAIN_ID : ASSETHUB_CHAIN_ID;
          const destination = {
            V4: {
              parents: 1,
              interior: {
                X2: [
                  { Parachain: destParachain },
                  { AccountId32: { network: null, id: accountId } }
                ]
              }
            }
          };
          
          tx = api.tx.xTokens.transfer(token.hydrationCurrencyId, amountRaw, destination, 'Unlimited');
        }
      }
      // FROM UNIQUE
      else if (sourceChain === 'unique' && token.uniqueCollectionId !== undefined) {
        if (destinationChain === 'assetHub' && (tokenSymbol === 'USDT' || tokenSymbol === 'WUD')) {
          // Unique → AssetHub (USDT/WUD returning home)
          const assetId = tokenSymbol === 'USDT' ? USDT_ASSET_ID : WUD_ASSET_ID;
          
          const destination = {
            V4: {
              parents: 1,
              interior: {
                X1: [{ Parachain: ASSETHUB_CHAIN_ID }]
              }
            }
          };
          
          const beneficiary = {
            V4: {
              parents: 0,
              interior: {
                X1: [{ AccountId32: { id: accountId } }]
              }
            }
          };
          
          const assets = {
            V4: [{
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
            }]
          };
          
          tx = api.tx.polkadotXcm.transferAssets(destination, beneficiary, assets, 0, 'Unlimited');
        } else if (destinationChain === 'hydration' && (tokenSymbol === 'USDT' || tokenSymbol === 'WUD')) {
          // Unique → Hydration (USDT/WUD via asset location)
          const assetId = tokenSymbol === 'USDT' ? USDT_ASSET_ID : WUD_ASSET_ID;
          
          const assetLocation = {
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
          
          const feeForExecution = new BigNumber(0.12)
            .multipliedBy(new BigNumber(10).pow(token.decimals))
            .integerValue(BigNumber.ROUND_DOWN)
            .toString(10);
          
          const feeAsset = {
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
              fun: { Fungible: feeForExecution }
            }
          };
          
          const destination = {
            V4: {
              parents: 1,
              interior: {
                X2: [
                  { Parachain: HYDRATION_CHAIN_ID },
                  { AccountId32: { network: null, id: accountId } }
                ]
              }
            }
          };
          
          console.log('Multi-hop transfer:', {
            sending: amount,
            feeWillBeDeducted: '0.12',
            recipientWillReceive: 'approximately ' + (parseFloat(amount) - 0.12)
          });
          
          tx = api.tx.xTokens.transferMultiassetWithFee(assetLocation, feeAsset, destination, 'Unlimited');

        } else if (destinationChain === 'relay' && tokenSymbol === 'DOT') {
          // Unique → Relay (DOT returning to Relay Chain)
          const destination = {
            V4: {
              parents: 1,
              interior: {
                X1: [{ 
                  AccountId32: { 
                    id: accountId
                  } 
                }]
              }
            }
          };
          
          tx = api.tx.xTokens.transfer(token.uniqueCollectionId, amountRaw, destination, 'Unlimited');
        } else {
          // Unique → AssetHub/Hydration (native tokens like DOT, UNQ)
          const destParachain = destinationChain === 'hydration' ? HYDRATION_CHAIN_ID : ASSETHUB_CHAIN_ID;
          const destination = {
            V4: {
              parents: 1,
              interior: {
                X2: [
                  { Parachain: destParachain },
                  { AccountId32: { network: null, id: accountId } }
                ]
              }
            }
          };
          
          tx = api.tx.xTokens.transfer(token.uniqueCollectionId, amountRaw, destination, 'Unlimited');
        }
      }
      // FROM RELAY (DOT to Unique)
      else if (sourceChain === 'relay') {
        if (!api) throw new Error('Polkadot API not connected');

        const destination = {
          V4: {
            parents: 0,
            interior: { X1: [{ Parachain: UNIQUE_CHAIN_ID }] },
          },
        };

        const beneficiary = {
          V4: {
            parents: 0,
            interior: { 
              X1: [{ 
                AccountId32: { 
                  id: accountId
                } 
              }] 
            },
          },
        };

        const assets = {
          V4: [
            {
              id: {
                parents: 0,
                interior: 'Here',
              },
              fun: { Fungible: amountRaw },
            },
          ],
        };

        console.log('XCM transfer (Polkadot → Unique):', {
          destination,
          beneficiary: beneficiary.V4.interior.X1[0].AccountId32.id,
          amount: amountRaw,
        });

        tx = api.tx.xcmPallet.limitedReserveTransferAssets(
          destination,
          beneficiary,
          assets,
          0,
          { Limited: { refTime: "5000000000", proofSize: "200000" } }
        );
      }
      // FROM ASSET HUB
      else if (sourceChain === 'assetHub') {
        const destParachain = destinationChain === 'unique' ? UNIQUE_CHAIN_ID : HYDRATION_CHAIN_ID;
        
        if (token.assetHubAssetId !== undefined) {
          // AssetHub → Unique/Hydration (USDT/WUD - native assets)
          const dest = { 
            V4: { 
              parents: 1, 
              interior: { X1: [{ Parachain: destParachain }] } 
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
              id: { 
                parents: 0, 
                interior: { 
                  X2: [
                    { PalletInstance: ASSET_HUB_PALLET_ASSETS }, 
                    { GeneralIndex: token.assetHubAssetId }
                  ] 
                } 
              },
              fun: { Fungible: amountRaw }
            }]
          };
          
          tx = api.tx.polkadotXcm.limitedReserveTransferAssets(
            dest, beneficiary, assets, 0, 
            { Limited: { refTime: "5000000000", proofSize: "200000" } }
          );
        } else if (tokenSymbol === 'DOT') {
          // AssetHub → Unique/Hydration (DOT - relay chain native token)
          const dest = { 
            V4: { 
              parents: 1, 
              interior: { X1: [{ Parachain: destParachain }] } 
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
              id: { 
                parents: 1,  // DOT is from parent (Relay)
                interior: 'Here' 
              }, 
              fun: { Fungible: amountRaw } 
            }] 
          };
          
          tx = api.tx.polkadotXcm.limitedReserveTransferAssets(
            dest, beneficiary, assets, 0, 
            { Limited: { refTime: "5000000000", proofSize: "200000" } }
          );
        } else {
          throw new Error('Unsupported token for AssetHub transfer');
        }
      } else {
        throw new Error('Unsupported transfer route');
      }

      if (!tx) {
        throw new Error('Failed to create transaction');
      }

      console.log('Transaction created successfully!');
      console.log('Section:', tx.method.section);
      console.log('Method:', tx.method.method);
      console.log('Args:', JSON.stringify(tx.method.args, null, 2));
      console.log('Hash:', tx.hash.toHex());

      setMessage('Connecting to wallet...');
      
      // Get injector and account
      const { injector, account } = await getInjectorForAccount(selectedAccount.address);

      setMessage('Requesting signature...');
      console.log('=== Signing transaction ===');
      console.log('Account:', account.address);
      console.log('Injector source:', injector.name);
      
      // Get account nonce
      const nonce = await api.rpc.system.accountNextIndex(account.address);
      console.log('Account nonce:', nonce.toString());
      
      // Sign payload first (this triggers extension popup)
      console.log('Calling signAsync...');
      const signedPayload = await tx.signAsync(account.address, { 
        signer: injector.signer,
        nonce: nonce
      });
      
      console.log('Payload signed! Sending transaction...');
      setMessage('Broadcasting transaction...');
      
      // Now send the signed transaction
      await signedPayload.send((result) => {
        console.log('Transaction status:', result.status.type);
        
        if (result.status.isInBlock) {
          console.log('In block:', result.status.asInBlock.toString());
          
          const success = result.events.some(({ event }) => 
            event.section === 'system' && event.method === 'ExtrinsicSuccess'
          );
          
          const failed = result.events.some(({ event }) => 
            (event.section === 'xTokens' && event.method === 'XcmExecutionFailed') ||
            (event.section === 'polkadotXcm' && event.method === 'LocalExecutionIncomplete')
          );
          
          if (success && !failed) {
            setStatus('success');
            setMessage(`Successfully transferred ${amount} ${tokenSymbol}`);
            setTxHash(result.txHash.toString());
            setTimeout(handleClose, 9000);
          } else {
            setStatus('error');
            setMessage('Transaction execution failed on blockchain');
            setTxHash(result.txHash.toString());
          }
        } else if (result.isError) {
          console.error('Transaction error:', result);
          setStatus('error');
          setMessage('Transaction error occurred');
        }
      });

      console.log('Transaction submitted');
    } catch (error: any) {
      console.error('Transfer error:', error);
      setStatus('error');
      
      // User-friendly error messages
      if (error.message?.includes('Cancelled') || error.message?.includes('cancelled')) {
        setMessage('Transaction cancelled by user');
      } else if (error.message?.includes('extension')) {
        setMessage(error.message);
      } else if (error.message?.includes('1010')) {
        setMessage('Insufficient balance for transaction fee');
      } else if (error.message?.includes('Minimum') || error.message?.includes('Maximum')) {
        setMessage(error.message);
      } else {
        setMessage(error.message || 'Transfer failed. Please try again');
      }
    }
  };

  if (!isVisible) return null;

  const amountNum = parseFloat(amount || '0');
  const balanceNum = parseFloat(sourceBalance.replace(/[,\s]/g, ''));
  
  // Special requirement for DOT transfers from Relay Chain
  const isRelayDotTransfer = sourceChain === 'relay' && tokenSymbol === 'DOT' && destinationChain === 'unique';
  const relayMinBalance = isRelayDotTransfer ? MIN_BALANCE_AFTER_TRANSFER_DOT_RELAY : 0;
  
  // Calculate destination fee based on route
  // Fee is sent as separate asset for XCM execution costs, NOT added to user amount
  const needsDestFee = (
    (sourceChain === 'hydration' || sourceChain === 'unique') &&
    (tokenSymbol === 'USDT' || tokenSymbol === 'WUD') &&
    (destinationChain === 'assetHub' || destinationChain === 'unique' || destinationChain === 'hydration') &&
    sourceChain !== destinationChain  // Don't add fee for same chain
  );
  
  // Multi-hop transfers have higher execution costs
  const isMultiHop = (
    (sourceChain === 'hydration' && destinationChain === 'unique') ||
    (sourceChain === 'unique' && destinationChain === 'hydration')
  ) && (tokenSymbol === 'USDT' || tokenSymbol === 'WUD');
  
  // Fee sent as separate asset for XCM execution
  const destFee = needsDestFee ? (isMultiHop ? 0.12 : 0.05) : 0;
  const totalAmount = amountNum + destFee + relayMinBalance;
  
  const isValid = !isNaN(amountNum) && 
                  amountNum > 0 &&
                  amountNum >= token.minTransfer && 
                  amountNum <= token.maxTransfer && 
                  totalAmount <= balanceNum;

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
                placeholder={`Min: ${token.minTransfer}`}
                disabled={status === 'pending'}
              />
              <Info>
                <span>Min: {token.minTransfer} {tokenSymbol}</span>
                <span>Available: {sourceBalance} {tokenSymbol}</span>
              </Info>
              
              {needsDestFee && amount && amountNum > 0 && (
                <FeeBreakdown>
                  {isMultiHop && (
                    <RouteInfo>
                      🔄 Multi-hop route: {fromChain.name} → AssetHub → {toChain.name}
                      <RouteNote>Separate fee asset sent to cover execution costs on all hops</RouteNote>
                    </RouteInfo>
                  )}
                  <FeeRow>
                    <span>Recipient receives:</span>
                    <span>{amountNum.toFixed(tokenSymbol === 'USDT' ? 2 : 4)} {tokenSymbol}</span>
                  </FeeRow>
                  <FeeRow>
                    <span>Fee for execution costs:</span>
                    <span>+{destFee.toFixed(tokenSymbol === 'USDT' ? 2 : 4)} {tokenSymbol}</span>
                  </FeeRow>
                  <FeeDivider />
                  <FeeRow $bold>
                    <span>Total deducted from balance:</span>
                    <span>{totalAmount.toFixed(tokenSymbol === 'USDT' ? 2 : 4)} {tokenSymbol}</span>
                  </FeeRow>
                  <FeeNote>
                    The fee is sent as a separate asset for XCM execution costs{isMultiHop && ' across all hops'}.
                  </FeeNote>
                </FeeBreakdown>
              )}
              
              {amount && !isValid && amountNum > 0 && (
                <Warning>
                  {amountNum < token.minTransfer && `Amount must be at least ${token.minTransfer} ${tokenSymbol}`}
                  {amountNum > token.maxTransfer && `Amount cannot exceed ${token.maxTransfer} ${tokenSymbol}`}
                  {totalAmount > balanceNum && (
                    isRelayDotTransfer 
                      ? `Insufficient balance. Need ${totalAmount.toFixed(4)} ${tokenSymbol} (${amountNum} transfer + ${relayMinBalance} must remain for Existential Deposit)`
                      : `Insufficient balance. Need ${totalAmount.toFixed(tokenSymbol === 'USDT' ? 2 : 4)} ${tokenSymbol} (including ${destFee} execution fee)`
                  )}
                </Warning>
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
  margin-top: -4px;
`;

const FeeBreakdown = styled.div`
  background: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
`;

const FeeRow = styled.div<{ $bold?: boolean }>`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 6px;
  font-weight: ${p => p.$bold ? '600' : '400'};
  color: ${p => p.$bold ? '#000' : '#495057'};
  
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

const RouteInfo = styled.div`
  font-size: 12px;
  color: #0066cc;
  background: #e6f2ff;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  font-weight: 500;
`;

const RouteNote = styled.div`
  font-size: 11px;
  color: #666;
  margin-top: 4px;
  font-weight: 400;
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