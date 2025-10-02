import React, { useContext, useEffect, useMemo } from 'react';
import { Icon, Dropdown, Button, Text, Toggle } from 'components/UI';
import { AccountsManagerProps } from '../AccountsManager';
import { AccountCard } from './AccountCard';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useAccounts } from 'hooks/useAccounts';
import { ConnectWalletModalContext } from 'account/ConnectWalletModalContext';
import { BalanceLine } from 'components/UI/Table/BalanceDisplay';

const testid = 'header';

export const AccountsManagerDropdown = ({
  accounts,
  networks,
  activeNetwork,
  deposit,
  depositDescription,
  balance,
  symbol,
  stakeVisibility,
  isStakeDisabled,
  avatarRender,
  onAccountChange,
  onNetworkChange,
  onManageBalanceClick,
  onCopyAddressClick,
  onStakeClick,
  onOpenChange,
}: AccountsManagerProps) => {
  const { setIsOpenConnectWalletModal } = useContext(
    ConnectWalletModalContext
  );
  const { selectedAccount } = useAccounts();

  const allBalances = useMemo(() => {
    const balances = [];
    const symbolUpper = symbol.toUpperCase();
    
    if (symbol) {
      const sanitizedBalance = balance ? String(balance).replace(/\s/g, '') : '0';
      
      balances.push({
        tokenName: symbol,
        unit: symbol,
        amount: sanitizedBalance
      });
    }
    
    if (selectedAccount?.fungibleBalances) {
      for (const [tokenName, balanceData] of selectedAccount.fungibleBalances.entries()) {
        const unit = balanceData.unit || tokenName;
        
        if (unit.toUpperCase() !== symbolUpper) {
          balances.push({
            tokenName,
            unit,
            amount: balanceData.amount || '0'
          });
        }
      }
    }
    
    return balances;
  }, [selectedAccount, balance, symbol]);

    return (
      <AccountsManagerDropdownWrapper>
        <div className='accounts-manager-accounts'>
          <Text color='grey-500' size='s'>
            Account
          </Text>
          <Dropdown
            value={selectedAccount?.address}
            optionKey='address'
            options={accounts}
            optionRender={(option) => (
              <AccountCard
                {...option}
                avatarRender={avatarRender}
                onCopyAddressClick={onCopyAddressClick}
                onOpenChange={onOpenChange}
              />
            )}
            iconRight={{
              name: 'triangle',
              size: 8
            }}
            onChange={onAccountChange}
          >
            <div
              className='accounts-select'
              data-testid='accounts-select'
            >
              <AccountCard
                {...selectedAccount}
                avatarRender={avatarRender}
                onCopyAddressClick={onCopyAddressClick}
                onOpenChange={onOpenChange}
              />
            </div>
          </Dropdown>
          <CreateAccountButton
            testid={`${testid}-create-substrate-button`}
            title={'Сonnect or create wallet'}
            onClick={() => {
              setIsOpenConnectWalletModal(true);
              onOpenChange && onOpenChange(false);
            }}
          />
        </div>

        <div className='accounts-manager-networks'>
          <div className='accounts-manager-wallet'>
            <CaptionText color='grey-500' size='s'>
              Balance
            </CaptionText>
            <div className='wallet-content' data-testid='wallet-content'>
              {deposit && <DepositText size='s' weight={'light'}>{`Deposit: ${deposit} ${symbol}`}</DepositText>}
              {depositDescription}
            </div>
            {allBalances.map(({ tokenName, unit, amount }) => (
              <BalanceLine
                token={unit}
                amount={amount}
                unit={unit}
                key={`balance_line_header_${tokenName}`}
              />
            ))}
          </div>
          {stakeVisibility && (
            <Button
              title='Stake'
              role='primary'
              disabled={isStakeDisabled}
              onClick={onStakeClick}
            />
          )}
        </div>

        <Link
          to={`/${activeNetwork?.id}/accounts`}
          onClick={onManageBalanceClick}
          title='Manage balances'
        >
          <CreateAccountButton title={'Manage balances'} />
        </Link>
      </AccountsManagerDropdownWrapper>
    );
};

const CaptionText = styled(Text)`
  line-height: 20px;
`;

const BalanceText = styled(Text)`
  line-height: 28px;
`;

const DepositText = styled(Text)`
  line-height: 20px;
`;

const AccountsManagerDropdownWrapper = styled.div`
    display: flex;
    flex-direction: column;
    row-gap: calc(var(--prop-gap) * 1.5);
    padding: 8px;
    padding-bottom: 16px;
    min-width: 236px;
    .unique-dropdown {
        width: 100%;
    }

  .accounts-manager-accounts {
    .unique-dropdown.touch > .dropdown-wrapper {
      width: 100%;
    }
    .unique-dropdown.touch > .dropdown-options {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16);
      width: 100%;
    }

    display: flex;
    flex-direction: column;
    row-gap: calc(var(--prop-gap) / 2);
    width: 100%;
    .accounts-select {
      border-radius: var(--prop-border-radius);
      border: 1px solid var(--color-grey-300);
      padding: 5px calc(var(--prop-gap) / 2);
      cursor: pointer;
    }
    .dropdown-options {
      max-height: 288px;
      overflow-y: auto;
      .dropdown-option {
        padding: 4px 8px;
        &:hover .account-card-content >.unique-text {
          color: var(--color-primary-500);
        }  
        .address-copy {
          line-height: 16px;
        }

        @media (max-width: 1024px) {
          &:hover {
            background-color: var(--color-additional-light);
            .account-card-content >.unique-text {
              color: var(--color-secondary-500);
            }
          }
        }
      }
      
    }
    .icon.icon-copy:hover {
      fill: var(--color-primary-500);
    }
  }

  .wallet-link {
    margin-top: calc(var(--prop-gap));
    a {
      font-size: 16px;
      font-weight: 500;
      color: var(--color-primary-500);
      &:hover {
        text-decoration: underline;
      }
    }
  }
  .accounts-manager-wallet {
    display: flex;
    flex-direction: column;
    row-gap: calc(var(--prop-gap) / 4);
    width: 100%;
    .wallet-content {
      display: flex;
      flex-direction: column;
      row-gap: calc(var(--prop-gap) / 4);
      width: 100%;
    }
  }
  .accounts-manager-networks {
    display: flex;
    flex-direction: column;
    padding-top: calc(var(--prop-gap) * 1.5);
    border-top: 1px dashed var(--color-blue-grey-300);
    row-gap: calc(var(--prop-gap) / 2);
    width: 100%;
    .network {
      display: flex;
      align-items: center;
      column-gap: calc(var(--prop-gap) / 2);
      width: 100%;
      & > .unique-text {
        flex-grow: 1;
      }
    }
    .networks-list {
      display: flex;
      flex-direction: column;
      row-gap: calc(var(--prop-gap) / 2);
      width: 100%;
    }
    
    .unique-toggle-wrapper .inner{
      &:after {
        width: 10px;
        height: 10px;
        top: 4px;
        left: 4px;
      }
      &.on:after {
        left: 18px;
      }
    }
  }
`;

const CreateAccountButton = styled(Button)`
  width: 243px;
  @media (max-width: 1024px) {
    width: 100%;
  }
`;
