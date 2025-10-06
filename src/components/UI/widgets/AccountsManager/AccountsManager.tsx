import React, { ReactNode, useMemo } from 'react';
import styled from 'styled-components';
import { AccountsManagerDropdown } from './components';
import { Text, Icon, Dropdown, CopyButton } from 'components/UI';
import useCopyToClipboard from './hooks/useCopyToClipboard';
import { SelectOptionProps } from 'components/UI/types';
import { IconProps } from 'components/UI/Icon/Icon';
import { useAccounts } from 'hooks/useAccounts';
import { useApi } from 'hooks/useApi';
import { ICurrency } from 'api/ApiContext';

export interface IAccount extends SelectOptionProps {
  address?: string;
  name?: string;
  fungibleBalances?: Map<string, { amount?: string; unit?: string }>;
}

export interface INetwork {
  id: string;
  name: string;
  icon: IconProps;
}

const isTouchDevice = 'ontouchstart' in document.documentElement;

export interface AccountsManagerProps {
  open?: boolean;
  accounts: IAccount[];
  selectedAccount?: IAccount;
  networks: INetwork[];
  activeNetwork?: INetwork;
  balance: string;
  deposit?: string;
  depositDescription?: ReactNode;
  manageBalanceLinkTitle?: string;
  symbol: string;
  isLoading?: boolean;
  isTouch?: boolean;
  stakeVisibility?: boolean;
  isStakeDisabled?: boolean;
  avatarRender?(address: string): ReactNode;
  onNetworkChange?(network: INetwork): void;
  onAccountChange?(account: IAccount): void;
  onManageBalanceClick?(): void;
  onOpenChange?(open: boolean): void;
  onCopyAddressClick?(address: string): void;
  onStakeClick?(): void;
}

export const AccountsManager = (props: AccountsManagerProps) => {
  const {
    open,
    balance,
    symbol,
    isTouch,
    onOpenChange,
    onCopyAddressClick
  } = props;

  const [_, copy] = useCopyToClipboard();
  const { selectedAccount } = useAccounts();
  const { currencyMap } = useApi();
  const touchDevice = isTouch || isTouchDevice;

  const formatAndRoundBalance = (value?: string): string => {
    if (!value) return '0';
    const sanitizedValue = String(value).replace(/\s/g, '');
    const numericValue = parseFloat(sanitizedValue);
    if (isNaN(numericValue)) return '0';
    
    const rounded = numericValue.toFixed(2);

    if (rounded.endsWith('.00')) {
      return rounded.slice(0, -3);
    }
    
    return rounded;
  };

  const tokenInfoBySymbol = useMemo(() => {
    const newMap = new Map<string, ICurrency>();
    if (currencyMap) {
      for (const currency of currencyMap.values()) {
        newMap.set(currency.title.toUpperCase(), currency);
      }
    }
    return newMap;
  }, [currencyMap]);

  const dotBalance = useMemo(() => {
    if (!selectedAccount?.fungibleBalances) return null;
    
    for (const [tokenName, balanceData] of selectedAccount.fungibleBalances.entries()) {
      const unit = balanceData.unit || tokenName;
      if (unit.toUpperCase() === 'DOT') {
        return {
          tokenName,
          unit,
          amount: balanceData.amount || '0'
        };
      }
    }
    return null;
  }, [selectedAccount]);

  const shortAddress = useMemo(() => {
    const address = selectedAccount?.address;
    return address && address.length > 13 
      ? `${address.slice(0, 5)}...${address.slice(-5)}` 
      : address;
  }, [selectedAccount?.address]);

  const mainTokenIconUrl = tokenInfoBySymbol.get(symbol.toUpperCase())?.iconUrl;
  const dotTokenIconUrl = dotBalance ? tokenInfoBySymbol.get(dotBalance.unit.toUpperCase())?.iconUrl : null;

  return (
    <DropdownStyled
      dropdownRender={() => (
        <AccountsManagerDropdown {...props} isTouch={touchDevice} onOpenChange={onOpenChange} />
      )}
      iconRight={{
        name: 'triangle',
        size: 8
      }}
      placement='right'
      open={open}
      onOpenChange={onOpenChange}
    >
      <AccountsManagerWrapper>
        <div className='account-left-section'>
          <div className='account-info'>
            <Text size='m' className='account-name'>
              {selectedAccount?.name}
            </Text>
            <div className='account-address-row'>
              <Text size='s' color='grey-500' className='account-address'>
                {shortAddress}
              </Text>
              <CopyButton
                onClick={(event) => {
                  if (!selectedAccount?.address) return;
                  event.stopPropagation();
                  void copy(selectedAccount.address);
                  onCopyAddressClick?.(selectedAccount.address);
                }}
                testid={`selected-address-copy-${selectedAccount?.address || ''}`}
              />
            </div>
          </div>
        </div>

        <div className='vertical-separator' />

        <div className='account-right-section'>
          <div className='token-balances'>
            <div className='balance-item'>
              {mainTokenIconUrl && <img src={mainTokenIconUrl} alt={`${symbol} icon`} className='token-icon' />}
              <Text size='s'>
                {formatAndRoundBalance(balance)} {symbol}
              </Text>
            </div>
            {dotBalance && (
              <div className='balance-item'>
                {dotTokenIconUrl && <img src={dotTokenIconUrl} alt={`${dotBalance.unit} icon`} className='token-icon' />}
                <Text size='s'>
                  {formatAndRoundBalance(dotBalance.amount)} {dotBalance.unit}
                </Text>
              </div>
            )}
          </div>
        </div>
      </AccountsManagerWrapper>
    </DropdownStyled>
  );
};

const DropdownStyled = styled(Dropdown)`
  .dropdown-options {
    top: calc(100% + 8px)
  }
`;

const AccountsManagerWrapper = styled.div`
  border: 1px solid var(--color-blue-grey-200);
  box-sizing: border-box;
  border-radius: calc(var(--prop-gap) / 2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 8px 12px;
  cursor: pointer;
  // min-width: 280px;
  max-height: 55px;
  
  &:hover {
    border: 1px solid var(--color-blue-grey-400);
  }

  .account-left-section {
    display: flex;
    align-items: center;
    column-gap: 8px;
    flex: 1;
    min-width: 0;
  }

  .vertical-separator {
    width: 1px;
    height: 32px;
    background-color: var(--color-blue-grey-200);
    margin: 0 12px;
    flex-shrink: 0;
  }

  .account-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;

    .account-name {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      line-height: 18px;
      font-size: 14px;
    }

    .account-address-row {
      display: flex;
      align-items: center;
      column-gap: 4px;

      .account-address {
        line-height: 14px;
        font-size: 12px;
      }

      .address-copy {
        cursor: pointer;
        height: 14px;
        flex-shrink: 0;
      }
    }
  }

  .account-right-section {
    display: flex;
    align-items: center;
    column-gap: 12px;
    flex-shrink: 0;
  }

  .token-balances {
    margin-right: 20px;
    display: flex;
    flex-direction: column;
    row-gap: 2px;
    align-items: flex-end;

    .balance-item {
      display: flex;
      align-items: center;
      column-gap: 6px;

      .token-icon {
        width: 12px;
        height: 12px;
        flex-shrink: 0;
        border-radius: 50%;
      }

      .unique-text {
        font-size: 12px;
        line-height: 18px;
        white-space: nowrap;
      }
    }
  }

  .icon.icon-copy:hover {
    fill: var(--color-primary-500);
  }

  @media (max-width: 567px) {
    // min-width: 280px;
    padding: 6px 10px;
  }

  @media (max-width: 300px) {
    min-width: auto;
    padding: 6px 8px;

    .account-info {
      .account-name {
        font-size: 14px;
      }
    }

    .token-balances {
      .unique-text {
        font-size: 12px;
      }
    }
  }
`;