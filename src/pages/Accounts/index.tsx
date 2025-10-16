import React, { useCallback, useContext, useEffect, useState, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { Button } from 'components/UI';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import { PagePaper } from 'components/PagePaper/PagePaper';
import { TransferFundsModal } from './Modals/SendFunds';
import { formatBalance } from 'utils/textUtils';
import { useNavigate } from 'react-router-dom';
import { useDotBalance } from 'hooks/getDotBalance';

import { UniversalCrossChainTransferModal } from './UniversalCrossChainTransferModal';
import SubscanLogo from 'static/images/subscan-logo.png';

import { useHydrationBalances } from 'hooks/useHydrationBalances';
import { useUsdtBalance } from 'hooks/useUsdtBalance';
import { useWudBalance } from 'hooks/useWudBalance';

const testid = 'accounts-page';

const REFETCH_INTERVAL = 30000; 
const REFETCH_DURATION = 90000; 
const REFETCH_COUNT = REFETCH_DURATION / REFETCH_INTERVAL; // 8 times

type ChainType = 'unique' | 'relay' | 'assetHub' | 'hydration';

interface TransferModalState {
  isOpen: boolean;
  token: string;
  from: ChainType;
  to: ChainType;
  balance: string;
}

interface TokenBalance {
  collectionId: string;
  name: string;
  iconUrl: string;
  decimals: number;
  uniqueBalance: string;
  relayBalance?: string;
  assetHubBalance?: string;
  hydrationBalance?: string;
  canSend: boolean;
  canTransferFromRelay?: boolean;
  canTransferFromAssetHub?: boolean;
  canTransferFromHydration?: boolean;
}

const formatNumberWithCommas = (value: string | number): string => {
  const cleanValue = typeof value === 'string' ? value.replace(/[,\s]/g, '') : value;
  const num = typeof cleanValue === 'string' ? parseFloat(cleanValue) : cleanValue;
  if (isNaN(num)) return '0';
  
  const parts = num.toFixed(4).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const decimalPart = parts[1];
  
  return `${integerPart}.${decimalPart}`;
};

const isTransferAvailable = (token: string, from: ChainType, to: ChainType): boolean => {
  return true;
};

const getDisabledTooltip = (token: string, from: ChainType, to: ChainType): string | undefined => {
  if (!isTransferAvailable(token, from, to)) {
    return `${token} transfers between Unique and Hydration are temporarily unavailable until AssetHub Migration (early November). Workaround: use AssetHub as intermediate chain.`;
  }
  return undefined;
};

export const AccountsPage = () => {
  const { accounts, isLoading, selectedAccount } = useAccounts();
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string | undefined>();
  const [transferModal, setTransferModal] = useState<TransferModalState>({
    isOpen: false,
    token: '',
    from: 'unique',
    to: 'hydration',
    balance: '0'
  });
  
  const refetchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const refetchCountRef = useRef<number>(0);
  
  const navigate = useNavigate();
  const { chainProperties, currentChainId, currencyMap } = useApi();

  const { 
    uniqueDotBalance,
    polkadotRelayBalance,
    isLoading: isDotLoading,
    refetch: refetchDotBalance 
  } = useDotBalance(selectedAccount);

  const { 
    uniqueUsdtBalance, 
    assetHubUsdtBalance, 
    isLoading: isUsdtLoading,
    refetch: refetchUsdtBalance
  } = useUsdtBalance(selectedAccount);

  const {
    dotBalance: hydrationDotBalance,
    unqBalance: hydrationUnqBalance,
    usdtBalance: hydrationUsdtBalance,
    wudBalance: hydrationWudBalance,
    isLoading: isHydrationLoading,
    refetch: refetchHydrationBalances
  } = useHydrationBalances(selectedAccount);

  const { 
    uniqueWudBalance, 
    assetHubWudBalance, 
    hydrationWudBalance: hydrationWudBalanceFromHook,
    isLoading: isWudLoading,
    refetch: refetchWudBalance
  } = useWudBalance(selectedAccount);

  const refetchAllBalances = useCallback(() => {
    refetchDotBalance();
    refetchUsdtBalance();
    refetchHydrationBalances();
    refetchWudBalance();
  }, [refetchDotBalance, refetchUsdtBalance, refetchHydrationBalances, refetchWudBalance]);

  const startPeriodicRefetch = useCallback((token: string) => {
    // Clear any existing interval
    if (refetchIntervalRef.current) {
      clearInterval(refetchIntervalRef.current);
    }
    
    // Reset counter
    refetchCountRef.current = 0;
    
    // Initial fetch
    refetchAllBalances();
    
    console.log(`Starting periodic balance refresh for ${token} (every 15s for 2 minutes)`);
    
    // Start interval
    refetchIntervalRef.current = setInterval(() => {
      refetchCountRef.current += 1;
      
      console.log(`Balance refresh ${refetchCountRef.current}/${REFETCH_COUNT} for ${token}`);
      refetchAllBalances();
      
      // Stop after REFETCH_COUNT iterations (2 minutes)
      if (refetchCountRef.current >= REFETCH_COUNT) {
        console.log(`Stopping periodic refresh for ${token}`);
        if (refetchIntervalRef.current) {
          clearInterval(refetchIntervalRef.current);
          refetchIntervalRef.current = null;
        }
      }
    }, REFETCH_INTERVAL);
  }, [refetchAllBalances]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (refetchIntervalRef.current) {
        clearInterval(refetchIntervalRef.current);
      }
    };
  }, []);

  const openTransfer = useCallback((
    token: string,
    from: ChainType,
    to: ChainType,
    balance: string
  ) => {
    setTransferModal({ isOpen: true, token, from, to, balance });
  }, []);

  const tokenBalances = useMemo<TokenBalance[]>(() => {
    if (!currencyMap || currencyMap.size === 0) return [];

    const balances: TokenBalance[] = [];
    
    currencyMap.forEach((currency) => {
      const collectionId = currency.collectionId.toString();
      
      if (collectionId === '0') {
        const unqBalance = parseFloat(formatBalance(selectedAccount?.balances?.proper.parsed || '0', 4));
        const hydrationUnqBalanceNum = parseFloat(hydrationUnqBalance || '0');
        balances.push({
          collectionId,
          name: currency.name,
          iconUrl: currency.iconUrl,
          decimals: currency.decimals,
          uniqueBalance: formatBalance(selectedAccount?.balances?.proper.parsed || '0', 4),
          hydrationBalance: isHydrationLoading ? '...' : hydrationUnqBalance,
          canSend: unqBalance > 0,
          canTransferFromHydration: hydrationUnqBalanceNum > 0
        });
      } else if (currency.name === 'DOT') {
        const dotOnUniqueBalance = parseFloat(uniqueDotBalance || '0');
        const dotOnRelayBalance = parseFloat(polkadotRelayBalance || '0');
        const dotOnHydrationBalance = parseFloat(hydrationDotBalance || '0');
        balances.push({
          collectionId,
          name: currency.name,
          iconUrl: currency.iconUrl,
          decimals: currency.decimals,
          uniqueBalance: isDotLoading ? '...' : (uniqueDotBalance || '0'),
          relayBalance: isDotLoading ? '...' : (polkadotRelayBalance || '0'),
          hydrationBalance: isHydrationLoading ? '...' : hydrationDotBalance,
          canSend: dotOnUniqueBalance > 0,
          canTransferFromRelay: dotOnRelayBalance > 0,
          canTransferFromHydration: dotOnHydrationBalance > 0
        });
      } else if (currency.name === 'USDT') {
        const usdtOnUniqueBalance = parseFloat(uniqueUsdtBalance || '0');
        const usdtOnAssetHubBalance = parseFloat(assetHubUsdtBalance || '0');
        const usdtOnHydrationBalance = parseFloat(hydrationUsdtBalance || '0');
        
        balances.push({
          collectionId,
          name: currency.name,
          iconUrl: currency.iconUrl,
          decimals: currency.decimals,
          uniqueBalance: isUsdtLoading ? '...' : uniqueUsdtBalance,
          assetHubBalance: isUsdtLoading ? '...' : assetHubUsdtBalance,
          hydrationBalance: isHydrationLoading ? '...' : hydrationUsdtBalance,
          canSend: usdtOnUniqueBalance > 0,
          canTransferFromAssetHub: usdtOnAssetHubBalance > 0,
          canTransferFromHydration: usdtOnHydrationBalance > 0
        });
      } else if (currency.name === 'WUD') {
        const wudOnUniqueBalance = parseFloat(uniqueWudBalance || '0');
        const wudOnAssetHubBalance = parseFloat(assetHubWudBalance || '0');
        const wudOnHydrationBalance = parseFloat(hydrationWudBalance || '0');
        
        balances.push({
          collectionId,
          name: currency.name,
          iconUrl: currency.iconUrl,
          decimals: currency.decimals,
          uniqueBalance: isWudLoading ? '...' : uniqueWudBalance,
          assetHubBalance: isWudLoading ? '...' : assetHubWudBalance,
          hydrationBalance: isHydrationLoading ? '...' : hydrationWudBalance,
          canSend: wudOnUniqueBalance > 0,
          canTransferFromAssetHub: wudOnAssetHubBalance > 0,
          canTransferFromHydration: wudOnHydrationBalance > 0
        });
      }
    });

    return balances;
  }, [currencyMap, selectedAccount, uniqueDotBalance, polkadotRelayBalance, isDotLoading, 
      uniqueUsdtBalance, assetHubUsdtBalance, hydrationUsdtBalance, isUsdtLoading,
      hydrationDotBalance, hydrationUnqBalance, isHydrationLoading,
      uniqueWudBalance, assetHubWudBalance, hydrationWudBalanceFromHook, isWudLoading]);

  useEffect(() => {
    if (!isLoading && !accounts.size) {
      navigate(`/${currentChainId}/market`);
    }
  }, [accounts, isLoading, navigate, currentChainId]);

  const truncateAddress = (address: string) => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const copyToClipboard = useCallback(() => {
    if (selectedAccount?.address) {
      navigator.clipboard.writeText(selectedAccount.address);
    }
  }, [selectedAccount]);

  if (isLoading || !selectedAccount) {
    return (
      <PagePaper>
        <LoadingContainer>Loading account...</LoadingContainer>
      </PagePaper>
    );
  }

  return (
    <PagePaper>
      <Wrapper>
        <GridContainer>
          <TableContainer>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <Th align="left">Token</Th>
                  <Th align="left">Chain</Th>
                  <Th align="right">Balance</Th>
                  <Th align="left">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {tokenBalances.map((token, tokenIndex) => {
                  const isUNQ = token.collectionId === '0';
                  const isLastToken = tokenIndex === tokenBalances.length - 1;

                  let rowSpan = 1;
                  if (token.relayBalance) rowSpan++;
                  if (token.assetHubBalance) rowSpan++;
                  if (token.hydrationBalance) rowSpan++;

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
                              <TokenLink href="https://app.hydration.net/trade/swap?assetIn=5&assetOut=25" target="_blank">
                                Buy with Hydration ↗
                              </TokenLink>
                              <TokenLink href="https://unique.network/staking/" target="_blank">
                                Stake ↗
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
                            <StyledButton 
                              title="Send" 
                              onClick={() => {
                                setSelectedCurrency(token.collectionId);
                                setSendModalVisible(true);
                              }}
                              disabled={!token.canSend}
                              size="small"
                            />
                            {token.name === 'DOT' && (
                              <>
                                <CrossChainButton 
                                  title="To Relay Chain" 
                                  onClick={() => openTransfer('DOT', 'unique', 'relay', token.uniqueBalance)}
                                  disabled={!token.canSend}
                                  size="small"
                                />
                                <CrossChainButton 
                                  title="To Hydration" 
                                  onClick={() => openTransfer('DOT', 'unique', 'hydration', token.uniqueBalance)}
                                  disabled={!token.canSend}
                                  size="small"
                                />
                              </>
                            )}
                            {token.name === 'USDT' && (
                              <>
                                <CrossChainButton 
                                  title="To Asset Hub" 
                                  onClick={() => openTransfer('USDT', 'unique', 'assetHub', token.uniqueBalance)}
                                  disabled={!token.canSend}
                                  size="small"
                                />
                                <ButtonWrapper 
                                  title={getDisabledTooltip('USDT', 'unique', 'hydration')}
                                >
                                  <CrossChainButton 
                                    title={isTransferAvailable('USDT', 'unique', 'hydration') ? "To Hydration" : "Unavailable until November"}
                                    onClick={() => openTransfer('USDT', 'unique', 'hydration', token.uniqueBalance)}
                                    disabled={!token.canSend || !isTransferAvailable('USDT', 'unique', 'hydration')}
                                    size="small"
                                  />
                                </ButtonWrapper>
                              </>
                            )}
                            {isUNQ && (
                              <CrossChainButton 
                                title="To Hydration" 
                                onClick={() => openTransfer('UNQ', 'unique', 'hydration', token.uniqueBalance)}
                                disabled={!token.canSend}
                                size="small"
                              />
                            )}
                            {token.name === 'WUD' && (
                              <>
                                <CrossChainButton 
                                  title="To Asset Hub" 
                                  onClick={() => openTransfer('WUD', 'unique', 'assetHub', token.uniqueBalance)}
                                  disabled={!token.canSend}
                                  size="small"
                                />
                                <CrossChainButton 
                                  title="To Hydration" 
                                  onClick={() => openTransfer('WUD', 'unique', 'hydration', token.uniqueBalance)}
                                  disabled={!token.canSend}
                                  size="small"
                                />
                              </>
                            )}
                          </ActionsCell>
                        </Td>
                      </tr>

                      {token.relayBalance && (
                        <tr>
                          <Td>
                            <ChainName>Polkadot Relay</ChainName>
                            <ChainDescription>Transfer {token.name} to Unique Network</ChainDescription>
                          </Td>
                          <Td align="right">
                            <BalanceText>{token.relayBalance}</BalanceText>
                          </Td>
                          <Td>
                            <ActionsCell>
                              <CrossChainButton 
                                title="To Unique" 
                                onClick={() => openTransfer(token.name, 'relay', 'unique', token.relayBalance!)}
                                disabled={!token.canTransferFromRelay}
                                size="small"
                              />
                            </ActionsCell>
                          </Td>
                        </tr>
                      )}

                      {token.assetHubBalance && (
                        <tr>
                          <Td>
                            <ChainName>Asset Hub</ChainName>
                            <ChainDescription>Transfer {token.name} to Unique Network</ChainDescription>
                          </Td>
                          <Td align="right">
                            <BalanceText>{token.assetHubBalance}</BalanceText>
                          </Td>
                          <Td>
                            <ActionsCell>
                              <CrossChainButton 
                                title="To Unique" 
                                onClick={() => openTransfer(token.name, 'assetHub', 'unique', token.assetHubBalance!)}
                                disabled={!token.canTransferFromAssetHub}
                                size="small"
                              />
                            </ActionsCell>
                          </Td>
                        </tr>
                      )}

                      {token.hydrationBalance && (
                        <tr>
                          <Td>
                            <ChainName>Hydration</ChainName>
                            <ChainDescription>Transfer {token.name} to Unique Network</ChainDescription>
                          </Td>
                          <Td align="right">
                            <BalanceText>{token.hydrationBalance}</BalanceText>
                          </Td>
                          <Td>
                            <ActionsCell>
                              <ButtonWrapper 
                                title={getDisabledTooltip(token.name, 'hydration', 'unique')}
                              >
                                <CrossChainButton 
                                  title={isTransferAvailable(token.name, 'hydration', 'unique') ? "To Unique" : "Unavailable until November"}
                                  onClick={() => openTransfer(token.name, 'hydration', 'unique', token.hydrationBalance!)}
                                  disabled={!token.canTransferFromHydration || !isTransferAvailable(token.name, 'hydration', 'unique')}
                                  size="small"
                                />
                              </ButtonWrapper>
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

          <SummaryCard>
            <ProfileHeader>
              <ProfileName>{selectedAccount.name || 'Account'}</ProfileName>
              <a 
                href={`https://portfolio.subscan.io/account/${selectedAccount.address}`}
                target="_blank"
                rel="noopener noreferrer"
                title="View on Subscan Portfolio"
              >
                <AvatarImage src={SubscanLogo} alt="View on Subscan" />
              </a>
            </ProfileHeader>

            <AddressBox>
              <AddressText>{truncateAddress(selectedAccount.address)}</AddressText>
              <CopyButton onClick={copyToClipboard}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </CopyButton>
            </AddressBox>

            <BalanceList>
              {tokenBalances.map((token) => {
                const uniqueNum = parseFloat(token.uniqueBalance.replace(/[,\s]/g, '')) || 0;
                const relayNum = token.relayBalance ? parseFloat(token.relayBalance.replace(/[,\s]/g, '')) || 0 : 0;
                const assetHubNum = token.assetHubBalance ? parseFloat(token.assetHubBalance.replace(/[,\s]/g, '')) || 0 : 0;
                const hydrationNum = token.hydrationBalance ? parseFloat(token.hydrationBalance.replace(/[,\s]/g, '')) || 0 : 0;
                
                const totalBalance = uniqueNum + relayNum + assetHubNum + hydrationNum;

                return (
                  <BalanceItem key={token.collectionId}>
                    <BalanceHeader>
                      <TokenIconImage src={token.iconUrl} alt={token.name} style={{ width: '32px', height: '32px' }} />
                      <TokenLabel>{token.name}</TokenLabel>
                    </BalanceHeader>
                    <BalanceAmount>{formatNumberWithCommas(totalBalance)}</BalanceAmount>
                  </BalanceItem>
                );
              })}
            </BalanceList>
          </SummaryCard>
        </GridContainer>

        <TransferFundsModal
          isVisible={sendModalVisible}
          onFinish={() => {
            setSendModalVisible(false);
            startPeriodicRefetch('UNQ');
          }}
          senderAddress={selectedAccount.address}
          preselectedCurrency={selectedCurrency}
          testid={`${testid}-transfer-funds-modal`}
        />

        <UniversalCrossChainTransferModal
          isVisible={transferModal.isOpen}
          onFinish={() => {
            const token = transferModal.token;
            setTransferModal(prev => ({ ...prev, isOpen: false }));
            startPeriodicRefetch(token);
          }}
          tokenSymbol={transferModal.token}
          sourceChain={transferModal.from}
          destinationChain={transferModal.to}
          sourceBalance={transferModal.balance}
          testid={`${testid}-cross-chain-modal`}
        />
      </Wrapper>
    </PagePaper>
  );
};

const Wrapper = styled.div`
  min-height: 100vh;
  background: #ffffff;
  @media (max-width: 768px) { padding: 10px; }
`;

const LoadingContainer = styled.div`
  padding: 40px;
  text-align: center;
`;

const GridContainer = styled.div`
  max-width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  @media (max-width: 1324px) { grid-template-columns: 1fr; }
`;

const TableContainer = styled.div`
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow-x: auto;
  table { border-collapse: collapse; min-width: 100%; }
  thead { background-color: #f8f9fa; }
`;

const Th = styled.th<{ align?: 'left' | 'right' }>`
  text-align: ${props => props.align || 'left'};
  padding: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Td = styled.td<{ align?: 'left' | 'right' }>`
  padding: 16px;
  text-align: ${props => props.align || 'left'};
  vertical-align: top;
  border-bottom: 1px solid #f1f3f5;
`;

const ActionsCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  button { width: 100%; min-width: 180px; }
`;

const ButtonWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
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
  object-fit: cover;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TokenLabel = styled.span`
  font-weight: 600;
  color: #212529;
  font-size: 15px;
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
  &:hover { text-decoration: underline; color: #0077b8; }
`;

const ChainName = styled.div`
  font-size: 14px;
  color: #495057;
  font-weight: 500;
`;

const ChainDescription = styled.div`
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
`;

const BalanceText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #212529;
  font-family: 'SF Mono', 'Monaco', monospace;
`;

const SummaryCard = styled.div`
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 24px;
  height: fit-content;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const ProfileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ProfileName = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #212529;
  margin: 0;
`;

const AvatarImage = styled.img`
  width: 48px;
  height: 48px;
  transition: opacity 0.2s, transform 0.2s;
  cursor: pointer;
  
  a:hover & {
    opacity: 0.8;
    transform: scale(1.05);
  }
`;

const AddressBox = styled.div`
  display: inline-flex;
  gap: 8px;
  margin-bottom: 32px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
`;

const AddressText = styled.span`
  font-size: 12px;
  font-family: monospace;
  color: #495057;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  transition: color 0.2s;
  &:hover { color: #009cf0; }
`;

const BalanceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const BalanceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  transition: all 0.2s ease;
  &:hover {
    border-color: #009cf0;
    box-shadow: 0 4px 12px rgba(0, 156, 240, 0.1);
    transform: translateY(-2px);
  }
`;

const BalanceHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BalanceAmount = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #212529;
  font-family: 'SF Mono', 'Monaco', monospace;
`;

const StyledButton = styled(Button)`
  && {
    transition: all 0.2s ease;
    font-weight: 500;
    &:hover:not(:disabled) {
      filter: brightness(1.1);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    &:disabled {
      background-color: #e9ecef !important;
      color: #adb5bd !important;
      border-color: #e9ecef !important;
      cursor: not-allowed;
    }
  }
`;

const CrossChainButton = styled(Button)`
  &&& {
    background-color: #009CF0 !important;
    color: white !important;
    border-color: #009CF0 !important;
    font-weight: 500;
    transition: all 0.2s ease;
    &:hover:not(:disabled) {
      background-color: #009CF0 !important;
      color: white !important;
      border-color: #009CF0 !important;
      opacity: 0.8;
    }
    &:disabled {
      background-color: #e9ecef !important;
      color: #adb5bd !important;
      border-color: #e9ecef !important;
      cursor: not-allowed;
      opacity: 1 !important;
    }
  }
`;