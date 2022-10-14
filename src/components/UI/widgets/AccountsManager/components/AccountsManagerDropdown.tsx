import { Toggle } from '@unique-nft/ui-kit';
import React from 'react';
import { Icon, Dropdown, Button, Text } from 'components/UI';
import { AccountsManagerProps } from '../AccountsManager';
import { AccountCard } from './AccountCard';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const AccountsManagerDropdown = ({
  accounts,
  selectedAccount,
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
  onStakeClick
}: AccountsManagerProps) => {
    return (
      <AccountsManagerDropdownWrapper>
        <div className='accounts-manager-accounts'>
          <Text color='grey-500' size='s'>
            Account
          </Text>
          <Dropdown
            optionKey='address'
            options={accounts}
            optionRender={(option) => (
              <AccountCard
                {...option}
                avatarRender={avatarRender}
                onCopyAddressClick={onCopyAddressClick}
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
              />
            </div>
          </Dropdown>
          <div
            className='wallet-link'
            data-testid={'wallet-link'}
          >
            <Link
              to={`/${activeNetwork?.id}/accounts`}
              onClick={onManageBalanceClick}
              title='Manage accounts'
            >Manage accounts</Link>
          </div>
        </div>
        <div className='accounts-manager-wallet'>
          <Text color='grey-500' size='s'>
            Balance
          </Text>
          <div className='wallet-content' data-testid='wallet-content'>
            <Text size='l'>{`${balance} ${symbol}`}</Text>
            {deposit && <Text size='s'>{`${deposit} ${symbol}`}</Text>}
            {depositDescription}
          </div>
        </div>
        {stakeVisibility && (
        <Button
          title='Stake'
          role='primary'
          disabled={isStakeDisabled}
          onClick={onStakeClick}
        />
            )}
        <div className='accounts-manager-networks'>
          <Text color='grey-500' size='s'>
            Active network
          </Text>
          {(!networks || networks.length === 0) && activeNetwork && (
            <div className='network'>
              <Icon {...activeNetwork.icon} size={16} />
              <Text>{activeNetwork.name}</Text>
            </div>
                )}
          {networks?.length > 0 && (
            <div className='networks-list'>
              {networks.map((network) => (
                <div
                  className='network'
                  key={`network-${network.id}`}
                  data-testid={`network-${network.id}`}
                >
                  <Icon {...network.icon} size={16} />
                  <Text>{network.name}</Text>
                  <Toggle
                    label=''
                    onChange={() => onNetworkChange?.(network)}
                    on={activeNetwork?.id === network.id}
                  />
                </div>
                        ))}
            </div>
                )}
        </div>
      </AccountsManagerDropdownWrapper>
    );
};

const AccountsManagerDropdownWrapper = styled.div`
    display: flex;
    flex-direction: column;
    row-gap: calc(var(--prop-gap) * 1.5);
    padding: calc(var(--prop-gap) * 1.5);
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
    }
    .icon.icon-copy:hover {
      fill: var(--color-primary-500);
    }
  }

  .wallet-link {
    margin-top: calc(var(--gap) / 2);
    a {
      font-size: 16px;
      font-weight: 500;
      color: var(--color-primary-500);
    }
  }
  .accounts-manager-wallet {
    display: flex;
    flex-direction: column;
    row-gap: calc(var(--prop-gap) / 2);
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
