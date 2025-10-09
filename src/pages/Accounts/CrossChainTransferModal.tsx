import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';

import { Button, Modal, Text } from 'components/UI';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3FromAddress, web3Enable } from '@polkadot/extension-dapp';
import { decodeAddress } from '@polkadot/util-crypto';
import BigNumber from 'bignumber.js';
import { useAccounts } from 'hooks/useAccounts';

const DOT_DECIMALS = 10;
const UNIQUE_CHAIN_ID = 2037;
const MIN_DOT_TRANSFER = 0.001;
const MAX_DOT_TRANSFER = 1000;
const MIN_BALANCE_AFTER_TRANSFER = 1.1; // Existential Deposit + buffer

const DOT_COLLECTION_ID = 437;
const WUD_COLLECTION_ID = 3779;

interface CrossChainTransferModalProps {
  isVisible: boolean;
  onFinish: () => void;
  polkadotBalance?: string;
  uniqueDotBalance?: string;
  initialDirection?: TransferDirection;
  testid?: string;
}

type TransferDirection = 'fromPolkadot' | 'toPolkadot';
type TransactionStatus = 'idle' | 'pending' | 'success' | 'error';

export const CrossChainTransferModal: React.FC<CrossChainTransferModalProps> = ({
  isVisible,
  onFinish,
  polkadotBalance = '0',
  uniqueDotBalance = '0',
  initialDirection = 'fromPolkadot',
  testid = 'cross-chain-modal',
}) => {
  const { selectedAccount } = useAccounts();
  
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDirection, setTransferDirection] = useState<TransferDirection>(initialDirection);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [txHash, setTxHash] = useState('');
  const [polkadotApi, setPolkadotApi] = useState<ApiPromise | null>(null);
  const [uniqueApi, setUniqueApi] = useState<ApiPromise | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const address = selectedAccount?.address;

  // Initialize APIs and set initial direction
  useEffect(() => {
    if (isVisible) {
      setTransferDirection(initialDirection);
      initializeApis();
    }
    return () => {
      if (polkadotApi) polkadotApi.disconnect();
      if (uniqueApi) uniqueApi.disconnect();
    };
  }, [isVisible, initialDirection]);

  const initializeApis = async () => {
    setIsConnecting(true);
    try {
      // await web3Enable('DOT Exchange');
      
      const polkadotProvider = new WsProvider('wss://rpc.polkadot.io');
      const uniqueProvider = new WsProvider('wss://ws.unique.network');
      
      const [polkadotApiInstance, uniqueApiInstance] = await Promise.all([
        ApiPromise.create({ provider: polkadotProvider }),
        ApiPromise.create({ provider: uniqueProvider }),
      ]);
      
      setPolkadotApi(polkadotApiInstance);
      setUniqueApi(uniqueApiInstance);
      
      console.log('Both APIs connected');
    } catch (error) {
      console.error('Failed to connect:', error);
      setStatusMessage('Failed to connect to blockchain networks');
      setTransactionStatus('error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleClose = useCallback(() => {
    setTransferAmount('');
    setTransactionStatus('idle');
    setStatusMessage('');
    setTxHash('');
    setTransferDirection(initialDirection);
    if (polkadotApi) {
      polkadotApi.disconnect();
      setPolkadotApi(null);
    }
    if (uniqueApi) {
      uniqueApi.disconnect();
      setUniqueApi(null);
    }
    onFinish();
  }, [onFinish, polkadotApi, uniqueApi, initialDirection]);

  const executeTransfer = async () => {
    if (!address || !transferAmount) return;

    setTransactionStatus('pending');
    setStatusMessage('Validating transfer...');
    await web3Enable('DOT Exchange');

    try {
      const transferAmountNum = parseFloat(transferAmount);

      if (transferAmountNum < MIN_DOT_TRANSFER) {
        throw new Error(`Minimum transfer amount is ${MIN_DOT_TRANSFER} DOT`);
      }

      if (transferAmountNum > MAX_DOT_TRANSFER) {
        throw new Error(`Maximum transfer amount is ${MAX_DOT_TRANSFER} DOT`);
      }

      const amount = new BigNumber(transferAmount).multipliedBy(
        new BigNumber(10).pow(DOT_DECIMALS)
      );

      setStatusMessage('Connecting to wallet...');
      const injector = await web3FromAddress(address);

      if (transferDirection === 'fromPolkadot') {
        // Polkadot Relay Chain → Unique Network
        if (!polkadotApi) throw new Error('Polkadot API not connected');

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
                  id: decodeAddress(address)
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
              fun: { Fungible: amount.toString() },
            },
          ],
        };

        console.log('XCM transfer (Polkadot → Unique):', {
          destination,
          beneficiary: beneficiary.V4.interior.X1[0].AccountId32.id,
          amount: amount.toString(),
        });

        const tx = polkadotApi.tx.xcmPallet.limitedReserveTransferAssets(
          destination,
          beneficiary,
          assets,
          0,
          { Limited: { refTime: "5000000000", proofSize: "200000" } }
        );

        setStatusMessage('Signing transaction...');

        const unsub = await tx.signAndSend(
          address,
          { signer: injector.signer },
          (result) => {
            console.log('Transaction status:', result.status.type);

            if (result.status.isInBlock) {
              console.log('In block:', result.status.asInBlock.toString());
              
              const success = result.events.some(
                ({ event }) =>
                  event.section === 'system' && event.method === 'ExtrinsicSuccess'
              );

              if (success) {
                setTransactionStatus('success');
                setStatusMessage(
                  `Successfully transferred ${transferAmount} DOT to Unique Network`
                );
                setTxHash(result.txHash.toString());
                setTimeout(handleClose, 3000);
              } else {
                setTransactionStatus('error');
                setStatusMessage('Transaction failed');
              }

              unsub();
            } else if (result.isError) {
              setTransactionStatus('error');
              setStatusMessage('Transaction failed');
              unsub();
            }
          }
        );
      } else {
        // Unique Network → Polkadot Relay Chain
        if (!uniqueApi) throw new Error('Unique API not connected');

        const destination = {
          V4: {
            parents: 1,
            interior: {
              X1: [{ 
                AccountId32: { 
                  id: decodeAddress(address)
                } 
              }]
            },
          },
        };

        console.log('XCM transfer (Unique → Polkadot):', {
          collectionId: DOT_COLLECTION_ID,
          amount: amount.toString(),
          destination,
        });

        const tx = uniqueApi.tx.xTokens.transfer(
          DOT_COLLECTION_ID,
          amount.toString(),
          destination,
          'Unlimited'
        );

        setStatusMessage('Signing transaction...');

        const unsub = await tx.signAndSend(
          address,
          { signer: injector.signer },
          (result) => {
            console.log('Transaction status:', result.status.type);

            if (result.status.isInBlock) {
              console.log('In block:', result.status.asInBlock.toString());
              
              const success = result.events.some(
                ({ event }) =>
                  event.section === 'system' && event.method === 'ExtrinsicSuccess'
              );

              const xcmFailed = result.events.some(
                ({ event }) =>
                  event.section === 'xTokens' && event.method === 'XcmExecutionFailed'
              );

              if (success && !xcmFailed) {
                setTransactionStatus('success');
                setStatusMessage(
                  `Successfully transferred ${transferAmount} DOT to Polkadot Relay Chain`
                );
                setTxHash(result.txHash.toString());
                setTimeout(handleClose, 3000);
              } else {
                setTransactionStatus('error');
                setStatusMessage(xcmFailed ? 'XCM execution failed' : 'Transaction failed');
              }

              unsub();
            } else if (result.isError) {
              setTransactionStatus('error');
              setStatusMessage('Transaction failed');
              unsub();
            }
          }
        );
      }
    } catch (error) {
      console.error('Transfer failed:', error);
      setTransactionStatus('error');
      setStatusMessage(
        error instanceof Error ? error.message : 'Transfer failed'
      );
    }
  };

  const transferAmountNum = transferAmount ? parseFloat(transferAmount) : 0;
  const isAmountValid =
    transferAmountNum >= MIN_DOT_TRANSFER && transferAmountNum <= MAX_DOT_TRANSFER;
  
  const availableBalance = transferDirection === 'fromPolkadot' 
    ? parseFloat(polkadotBalance)
    : parseFloat(uniqueDotBalance);
  
  const isBalanceSufficient = 
    transferAmountNum > 0 && 
    availableBalance >= transferAmountNum + (
      transferDirection === 'fromPolkadot' 
        ? MIN_BALANCE_AFTER_TRANSFER
        : 0
    );

  const currentApi = transferDirection === 'fromPolkadot' ? polkadotApi : uniqueApi;

  return (
    <Modal isVisible={isVisible} isClosable onClose={handleClose}>
      <ModalContent data-testid={testid}>
        <ModalHeader>
          <Title>Cross-chain Transfer</Title>
          <Subtitle>Transfer DOT between Polkadot Relay Chain and Unique Network</Subtitle>
        </ModalHeader>

        {isConnecting ? (
          <LoadingState>
            <Text>Connecting to blockchain networks...</Text>
          </LoadingState>
        ) : (
          <ModalBody>
            {/* Transfer Direction */}
            <FormGroup>
              <Label>Transfer Direction</Label>
              <DirectionButtons>
                <DirectionButton
                  $active={transferDirection === 'fromPolkadot'}
                  onClick={() => setTransferDirection('fromPolkadot')}
                >
                  Polkadot → Unique
                </DirectionButton>
                <DirectionButton
                  $active={transferDirection === 'toPolkadot'}
                  onClick={() => setTransferDirection('toPolkadot')}
                >
                  Unique → Polkadot
                </DirectionButton>
              </DirectionButtons>
              <HelperText>
                {transferDirection === 'fromPolkadot'
                  ? 'Transfer DOT from Polkadot Relay Chain to Unique Network'
                  : 'Transfer DOT from Unique Network back to Polkadot Relay Chain'}
              </HelperText>
            </FormGroup>

            {/* Amount Input */}
            <FormGroup>
              <Label>
                Amount (DOT) - From: {transferDirection === 'fromPolkadot' ? 'Polkadot Relay' : 'Unique Network'}
              </Label>
              <Input
                type="number"
                inputMode="decimal"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0.000"
                min={MIN_DOT_TRANSFER}
                max={MAX_DOT_TRANSFER}
                step="0.001"
                $hasError={transferAmount !== '' && !isAmountValid}
              />
              <InputFooter>
                <HelperText>Min: {MIN_DOT_TRANSFER} DOT</HelperText>
                <HelperText>
                  Available: {transferDirection === 'fromPolkadot' ? polkadotBalance : uniqueDotBalance} DOT
                </HelperText>
              </InputFooter>

              {transferAmount && transferAmountNum < MIN_DOT_TRANSFER && (
                <ErrorText>Minimum transfer amount is {MIN_DOT_TRANSFER} DOT</ErrorText>
              )}

              {transferAmount && transferAmountNum > MAX_DOT_TRANSFER && (
                <ErrorText>Maximum transfer amount is {MAX_DOT_TRANSFER} DOT</ErrorText>
              )}

              {transferAmount && !isBalanceSufficient && (
                <ErrorText>
                  Insufficient balance. Available: {availableBalance.toFixed(3)} DOT, Required: ~
                  {(transferAmountNum + MIN_BALANCE_AFTER_TRANSFER).toFixed(3)} DOT (including fees)
                </ErrorText>
              )}
            </FormGroup>

            {/* Transaction Status */}
            {transactionStatus !== 'idle' && (
              <StatusBox $status={transactionStatus}>
                <StatusMessage>{statusMessage}</StatusMessage>
                {txHash && (
                  <TxHashLink
                    href={
                      transferDirection === 'fromPolkadot'
                        ? `https://polkadot.subscan.io/extrinsic/${txHash}`
                        : `https://unique.subscan.io/extrinsic/${txHash}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Subscan Explorer →
                  </TxHashLink>
                )}
              </StatusBox>
            )}

            {/* Action Buttons */}
            <ButtonGroup>
              <Button
                title="Cancel"
                onClick={handleClose}
                disabled={transactionStatus === 'pending'}
              />
              <Button
                title={
                  transactionStatus === 'pending' ? 'Processing...' : 'Execute Transfer'
                }
                role="primary"
                onClick={executeTransfer}
                disabled={
                  !transferAmount ||
                  !isAmountValid ||
                  !isBalanceSufficient ||
                  transactionStatus === 'pending' ||
                  !currentApi
                }
              />
            </ButtonGroup>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};

const ModalContent = styled.div`
  width: 100%;
  max-width: 540px;
`;

const ModalHeader = styled.div`
  margin-bottom: calc(var(--prop-gap) * 2);
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-grey-900);
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: var(--color-grey-500);
  margin: 0;
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--prop-gap) * 1.5);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--prop-gap) / 2);
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-grey-700);
`;

const DirectionButtons = styled.div`
  display: flex;
  gap: var(--prop-gap);
`;

const DirectionButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border-radius: 4px;
  border: 1px solid ${(props) => (props.$active ? 'var(--color-primary-500)' : '#e5e5e5')};
  background: ${(props) => (props.$active ? 'var(--color-primary-50)' : 'white')};
  color: ${(props) => (props.$active ? 'var(--color-primary-700)' : 'var(--color-grey-700)')};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${(props) => (props.$active ? 'var(--color-primary-100)' : '#f5f5f5')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 12px;
  border: 1px solid ${(props) => (props.$hasError ? '#ef4444' : '#e5e5e5')};
  border-radius: 4px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: ${(props) => (props.$hasError ? '#ef4444' : 'var(--color-primary-500)')};
  }

  &::placeholder {
    color: var(--color-grey-400);
  }
`;

const InputFooter = styled.div`
  display: flex;
  justify-content: space-between;
`;

const HelperText = styled.span`
  font-size: 12px;
  color: var(--color-grey-500);
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: #ef4444;
`;

const StatusBox = styled.div<{ $status: TransactionStatus }>`
  padding: 16px;
  border-radius: 4px;
  background: ${(props) => {
    switch (props.$status) {
      case 'success':
        return '#f0fdf4';
      case 'error':
        return '#fef2f2';
      case 'pending':
        return '#fefce8';
      default:
        return '#f9fafb';
    }
  }};
  border: 1px solid
    ${(props) => {
      switch (props.$status) {
        case 'success':
          return '#bbf7d0';
        case 'error':
          return '#fecaca';
        case 'pending':
          return '#fef08a';
        default:
          return '#e5e7eb';
      }
    }};
`;

const StatusMessage = styled.p`
  font-size: 14px;
  margin: 0 0 8px 0;
  color: var(--color-grey-900);
`;

const TxHashLink = styled.a`
  font-size: 12px;
  color: var(--color-primary-500);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: var(--prop-gap);
  margin-top: calc(var(--prop-gap) / 2);

  button {
    flex: 1;
  }
`;

const LoadingState = styled.div`
  padding: calc(var(--prop-gap) * 3) 0;
  text-align: center;
  color: var(--color-grey-500);
`;