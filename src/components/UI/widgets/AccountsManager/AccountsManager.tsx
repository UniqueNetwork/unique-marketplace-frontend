import React, { ReactNode, useEffect } from 'react';
import { AccountsManagerDropdown } from './components';
import styled from 'styled-components';
import { Dropdown, Text, IconProps, SelectOptionProps } from '@unique-nft/ui-kit';
import { Icon } from 'components/UI/Icon/Icon';
import useCopyToClipboard from './hooks/useCopyToClipboard';

export interface IAccount extends SelectOptionProps {
  address?: string;
  name?: string;
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
    selectedAccount,
    activeNetwork,
    balance,
    symbol,
    isTouch,
    onOpenChange,
    onCopyAddressClick
  } = props;

  const [copied, copy] = useCopyToClipboard();
  const touchDevice = isTouch || isTouchDevice;

  useEffect(() => {
    copied && onCopyAddressClick?.(copied);
  }, [copied]);

  return (
    <Dropdown
      dropdownRender={() => (
        <AccountsManagerDropdown {...props} isTouch={touchDevice} />
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
        <div className='accounts-manager-selected-account'>
          <div className='accounts-manager-selected-account-name'>
            <Text color='blue-grey-500' size='s'>
              {selectedAccount?.name}
            </Text>
            <div
              className='address-copy'
              onClick={(event) => {
                event.stopPropagation();
                copy(`${selectedAccount?.address}`);
              }}
              data-testid={`selected-address-copy-${selectedAccount?.address}`}
            >
              <Icon size={16} name='copy' />
            </div>
          </div>
          <Text size='s'>{`${balance} ${symbol}`}</Text>
        </div>
        <div className='accounts-manager-network'>
          {activeNetwork && (
            <Icon
              {...activeNetwork.icon}
              size={16}
            />
          )}
        </div>
      </AccountsManagerWrapper>
    </Dropdown>
  );
};

const AccountsManagerWrapper = styled.div`
  border: 1px solid var(--color-blue-grey-200);
  box-sizing: border-box;
  border-radius: calc(var(--prop-gap) / 2);
  display: flex;
  position: relative;
  padding: calc(var(--prop-gap) * 1.5 / 4) calc(var(--prop-gap) * 2)
  calc(var(--prop-gap) * 1.5 / 4) var(--prop-gap);

  .accounts-manager-selected-account {
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--color-blue-grey-200);
    padding-right: var(--prop-gap);
    cursor: pointer;
    justify-content: center;
    .unique-text {
      white-space: nowrap;
    }
    .accounts-manager-selected-account-name {
      display: flex;
      column-gap: calc(var(--prop-gap) / 4);
      .address-copy {
        cursor: pointer;
        
      }
    }
  }
  .accounts-manager-network {
    display: flex;
    align-items: center;
    padding-left: var(--prop-gap);
  }
  .account-copy {
    cursor: pointer;
  }
  .icon.icon-copy:hover {
    fill: var(--color-primary-500);
  }

  @media (max-width: 300px) {
    padding-top: 0;
    padding-bottom: 0;
    height: 46px;

    svg {
      display: block;
      fill: var(--color-primary-500);
    }

    .accounts-manager-selected-account {
      border-right: none;
      padding: 0;
    }

    .accounts-manager-selected-account-name,
    .accounts-manager-network {
      display: none;
    }
  }
        
  
`;
