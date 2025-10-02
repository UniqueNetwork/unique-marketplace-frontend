import React, { useCallback, useContext, useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { Button } from 'components/UI';
import { toChainFormatAddress } from 'api/chainApi/utils/addressUtils';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import { PagePaper } from 'components/PagePaper/PagePaper';
import GetKSMModal from 'components/GetKSMModal/GetKSMModal';
import { WithdrawDepositModal } from './Modals/WithdrawDeposit';
import { TransferFundsModal } from './Modals/SendFunds';

import config from 'config';
import { formatBalance } from 'utils/textUtils';
import { useNavigate } from 'react-router-dom';
import { ConnectWalletModalContext } from 'account/ConnectWalletModalContext';
import { useDotBalance } from 'hooks/getDotBalance';
import { CrossChainTransferModal } from './CrossChainTransferModal';

const testid = 'accounts-page';

enum AccountModal {
  sendFunds,
  withdrawDeposit,
  getKsmModal,
  crossChainTransfer
}

interface TokenBalance {
  collectionId: string;
  name: string;
  iconUrl: string;
  decimals: number;
  uniqueBalance: string;
  relayBalance?: string;
  canSend: boolean;
  canTransferFromRelay?: boolean;
}

export const AccountsPage = () => {
  const { setIsOpenConnectWalletModal } = useContext(ConnectWalletModalContext);
  const { accounts, isLoading, selectedAccount } = useAccounts();
  const [currentModal, setCurrentModal] = useState<AccountModal | undefined>();
  const [selectedCurrency, setSelectedCurrency] = useState<string | undefined>();
  const navigate = useNavigate();
  const { chainProperties, currentChainId, currencies, currencyMap } = useApi();

  const { 
    uniqueDotBalance,
    polkadotRelayBalance,
    isLoading: isDotLoading,
    refetch: refetchDotBalance 
  } = useDotBalance(selectedAccount);

  // Build token balances from currencyMap
  const tokenBalances = useMemo<TokenBalance[]>(() => {
    if (!currencyMap || currencyMap.size === 0) return [];

    const balances: TokenBalance[] = [];
    
    currencyMap.forEach((currency, key) => {
      const collectionId = currency.collectionId.toString();
      
      if (collectionId === '0') {
        // UNQ token
        const unqBalance = parseFloat(formatBalance(selectedAccount?.balances?.proper.parsed || '0', 4));
        balances.push({
          collectionId,
          name: currency.name,
          iconUrl: currency.iconUrl,
          decimals: currency.decimals,
          uniqueBalance: formatBalance(selectedAccount?.balances?.proper.parsed || '0', 4),
          canSend: unqBalance > 0
        });
      } else if (currency.name === 'DOT') {
        // DOT token
        const dotOnUniqueBalance = parseFloat(uniqueDotBalance || '0');
        const dotOnRelayBalance = parseFloat(polkadotRelayBalance || '0');
        balances.push({
          collectionId,
          name: currency.name,
          iconUrl: currency.iconUrl,
          decimals: currency.decimals,
          uniqueBalance: isDotLoading ? '...' : (uniqueDotBalance || '0'),
          relayBalance: isDotLoading ? '...' : (polkadotRelayBalance || '0'),
          canSend: dotOnUniqueBalance > 0,
          canTransferFromRelay: dotOnRelayBalance > 0
        });
      } else {
        // Other tokens (USDT, etc.)
        // Add logic here to fetch balances for other tokens when available
        balances.push({
          collectionId,
          name: currency.name,
          iconUrl: currency.iconUrl,
          decimals: currency.decimals,
          uniqueBalance: '0', // Placeholder - implement balance fetching
          canSend: false
        });
      }
    });

    return balances;
  }, [currencyMap, selectedAccount, uniqueDotBalance, polkadotRelayBalance, isDotLoading]);

  useEffect(() => {
    if (!isLoading && !accounts.size) {
      navigate(`/${currentChainId}/market`);
    }
  }, [accounts, isLoading, navigate, currentChainId]);

  useEffect(() => {
    setCurrentModal(undefined);
  }, [currentChainId]);

  const formatAddress = useCallback((address: string) => {
    return toChainFormatAddress(address, chainProperties?.SS58Prefix || 0);
  }, [chainProperties?.SS58Prefix]);

  const onAccountActionClick = useCallback((modal: AccountModal, currency?: string) => () => {
    if (!selectedAccount) return;
    setCurrentModal(modal);
    setSelectedCurrency(currency);
  }, [selectedAccount]);

  const onModalClose = useCallback(() => {
    setCurrentModal(undefined);
    refetchDotBalance();
  }, [refetchDotBalance]);

  const copyToClipboard = useCallback(() => {
    if (selectedAccount?.address) {
      navigator.clipboard.writeText(selectedAccount.address);
    }
  }, [selectedAccount]);

  if (isLoading || !selectedAccount) {
    return (
      <PagePaper>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading account...</div>
      </PagePaper>
    );
  }

  const account = selectedAccount;
  const tokenSymbol = chainProperties?.token || '';
  const scanUrl = currentChainId ? config.blockchains[currentChainId]?.scanUrl : '';
  const deposit = account.balances?.ethMirror.raw;
  const hasDeposit = deposit && !deposit.isZero();

  return (
    <PagePaper>
      <Wrapper>
        <GridContainer>
          {/* Left Panel - Token Table */}
          <TableContainer>
            <table style={{ width: '100%' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <Th align="left">Token</Th>
                  <Th align="left">Chain</Th>
                  <Th align="right">Balance</Th>
                  <Th align="left">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {tokenBalances.map((token) => {
                  const isUNQ = token.collectionId === '0';
                  const hasDOTRelay = token.name === 'DOT' && token.relayBalance;
                  const rowSpan = isUNQ && hasDeposit ? 2 : hasDOTRelay ? 2 : 1;

                  return (
                    <React.Fragment key={token.collectionId}>
                      <tr>
                        <Td rowSpan={rowSpan}>
                          <TokenRow>
                            <TokenIconImage src={token.iconUrl} alt={token.name} />
                            <TokenLabel>{token.name}</TokenLabel>
                          </TokenRow>
                          {isUNQ && (
                            <LinksContainer>
                              <TokenLink href="https://app.hydration.net/trade/swap?assetIn=5&assetOut=25" target="_blank" rel="noopener noreferrer">
                                Buy with Hydration
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M7 17L17 7M17 7H7M17 7V17"/>
                                </svg>
                              </TokenLink>
                              <TokenLink href="https://unique.network/staking/" target="_blank" rel="noopener noreferrer">
                                Stake
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M7 17L17 7M17 7H7M17 7V17"/>
                                </svg>
                              </TokenLink>
                            </LinksContainer>
                          )}
                        </Td>
                        <Td>
                          <ChainName>Unique Network</ChainName>
                        </Td>
                        <Td align="right">
                          <BalanceText>{token.uniqueBalance}</BalanceText>
                        </Td>
                        <Td>
                          <ActionsCell>
                            <Button 
                              title="Send" 
                              onClick={onAccountActionClick(AccountModal.sendFunds, token.collectionId)}
                              disabled={!token.canSend}
                              size="small"
                            />
                            {token.name === 'DOT' && (
                              <CrossChainButton 
                                title="Cross-chain transfer" 
                                onClick={onAccountActionClick(AccountModal.crossChainTransfer)}
                                disabled={!token.canSend}
                                size="small"
                              />
                            )}
                            {isUNQ && (
                              <CrossChainButton 
                                title="Cross-chain transfer" 
                                onClick={onAccountActionClick(AccountModal.withdrawDeposit)}
                                disabled={true}
                                size="small"
                              />
                            )}
                          </ActionsCell>
                        </Td>
                      </tr>

                      {/* UNQ Hydration deposit row */}
                      {isUNQ && hasDeposit && (
                        <tr>
                          <Td>
                            <ChainName>Hydration</ChainName>
                            <ChainDescription>
                              Transfer tokens to Unique Network to use on the Marketplace
                            </ChainDescription>
                          </Td>
                          <Td align="right">
                            <BalanceText>{formatBalance(account.balances?.ethMirror.parsed || '0', 4)}</BalanceText>
                          </Td>
                          <Td></Td>
                        </tr>
                      )}

                      {/* DOT Relay row */}
                      {hasDOTRelay && (
                        <tr>
                          <Td>
                            <ChainName>Polkadot Relay</ChainName>
                            <ChainDescription>
                              Transfer tokens to Unique Network to use on the Marketplace
                            </ChainDescription>
                          </Td>
                          <Td align="right">
                            <BalanceText>{token.relayBalance}</BalanceText>
                          </Td>
                          <Td>
                            <ActionsCell>
                              <CrossChainButton 
                                title="Cross-chain transfer" 
                                onClick={onAccountActionClick(AccountModal.crossChainTransfer)}
                                disabled={!token.canTransferFromRelay}
                                size="small"
                              />
                            </ActionsCell>
                          </Td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </TableContainer>

          {/* Right Panel - Balance Summary */}
          <SummaryCard>
            <ProfileHeader>
              <ProfileName>{account.name || 'Alex'}</ProfileName>
              <Avatar />
            </ProfileHeader>

            <AddressBox>
              <AddressText>{account.address}</AddressText>
              <CopyButton onClick={copyToClipboard}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </CopyButton>
            </AddressBox>

            {/* Balance Summary */}
            <BalanceList>
              {tokenBalances.map((token) => {
                const totalBalance = token.relayBalance 
                  ? (parseFloat(token.uniqueBalance) + parseFloat(token.relayBalance)).toFixed(token.decimals > 4 ? 4 : token.decimals)
                  : token.uniqueBalance;

                return (
                  <BalanceItem key={token.collectionId}>
                    <BalanceHeader>
                      <TokenIconImage src={token.iconUrl} alt={token.name} style={{ width: '32px', height: '32px' }} />
                      <TokenLabel>{token.name}</TokenLabel>
                    </BalanceHeader>
                    <BalanceAmount>{totalBalance}</BalanceAmount>
                  </BalanceItem>
                );
              })}
            </BalanceList>
          </SummaryCard>
        </GridContainer>

        {/* Modals */}
        <TransferFundsModal
          isVisible={currentModal === AccountModal.sendFunds}
          onFinish={onModalClose}
          senderAddress={account.address}
          preselectedCurrency={selectedCurrency}
          testid={`${testid}-transfer-funds-modal`}
        />
        <WithdrawDepositModal
          isVisible={currentModal === AccountModal.withdrawDeposit}
          onFinish={onModalClose}
          address={account.address}
          testid={`${testid}-withdraw-modal`}
        />
        <CrossChainTransferModal
          isVisible={currentModal === AccountModal.crossChainTransfer}
          onFinish={onModalClose}
          address={account.address}
          polkadotBalance={polkadotRelayBalance}
          testid={`${testid}-cross-chain-modal`}
        />
        {config.rampApiKey && currentModal === AccountModal.getKsmModal && (
          <GetKSMModal key="modal-accounts-getKsm" onClose={onModalClose} />
        )}
      </Wrapper>
    </PagePaper>
  );
};

const Wrapper = styled.div`
  min-height: 100vh;
  background: #ffffff;

  @media (max-width: 768px) {
    // padding: 16px;
  }
`;

const GridContainer = styled.div`
  max-width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 1324px) {
    grid-template-columns: 1fr;
  }
`;

const TableContainer = styled.div`
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;

  table {
    border-collapse: collapse;
  }

  thead {
    background-color: #e5e5e5;
  }
`;

const Th = styled.th<{ align?: 'left' | 'right' }>`
  text-align: ${props => props.align || 'left'};
  padding: 16px;
  font-size: 14px;
  font-weight: 500;
  color: #000000;
  border-bottom: 1px solid #e5e5e5;
`;

const Td = styled.td<{ align?: 'left' | 'right'; rowSpan?: number }>`
  padding: 16px;
  text-align: ${props => props.align || 'left'};
  vertical-align: top;
  border-bottom: 1px solid #e5e5e5;
`;

const ActionsCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  button {
    width: 100%;
    min-width: 180px;
    padding-left: 16px;
    padding-right: 16px;
  }
`;

const TokenRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TokenIconImage = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
`;

const TokenLabel = styled.span`
  font-weight: 500;
  color: #000000;
`;

const LinksContainer = styled.div`
  margin-top: 8px;
  margin-left: 32px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TokenLink = styled.a`
  color: #009cf0;
  font-size: 13px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  svg {
    flex-shrink: 0;
  }
`;

const ChainName = styled.div`
  font-size: 14px;
  color: #000000;
`;

const ChainDescription = styled.div`
  font-size: 12px;
  color: #9caab7;
  margin-top: 4px;
`;

const BalanceText = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #000000;
`;

const SummaryCard = styled.div`
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 24px;
  height: fit-content;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const ProfileName = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #000000;
  margin: 0;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff00ff 0%, #00ffff 100%);
  flex-shrink: 0;
`;

const AddressBox = styled.div`
  display: inline-flex;
  gap: 8px;
  margin-bottom: 32px;
`;

const AddressText = styled.span`
  font-size: 12px;
  font-family: monospace;
  color: #000000;
  word-break: break-all;
  flex: 1;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #81858e;
  padding: 0;
  display: flex;
  align-items: center;
  flex-shrink: 0;

  &:hover {
    color: #000000;
  }
`;

const BalanceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const BalanceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
`;

const BalanceHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BalanceAmount = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #000000;
  line-height: 1;
`;

const CrossChainButton = styled(Button)`
  && {
    background-color: #009CF0;
    color: white;
    border-color: #009CF0;

    &:hover:not(:disabled) {
      background-color: #0088d4;
      border-color: #0088d4;
    }

    &:disabled {
      background-color: #e5e5e5;
      color: #81858e;
      border-color: #e5e5e5;
    }
  }
`;