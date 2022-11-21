import React, { ReactNode } from 'react';
import { AccountsManagerDropdown } from './components';
import styled from 'styled-components';
import { IconProps, SelectOptionProps } from '@unique-nft/ui-kit';
import { Text, Icon, Dropdown, CopyButton } from 'components/UI';
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

  const [_, copy] = useCopyToClipboard();
  const touchDevice = isTouch || isTouchDevice;

  return (
    <DropdownStyled
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
            <Text color='blue-grey-500' size='s' title={selectedAccount?.name}>
              {selectedAccount?.name}
            </Text>
            <CopyButton
              onClick={(event) => {
                if (!selectedAccount?.address) return;
                event.stopPropagation();
                copy(selectedAccount.address);
                onCopyAddressClick?.(selectedAccount.address);
              }}
              testid={`selected-address-copy-${selectedAccount?.address}`}
            />
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
  position: relative;
  padding: calc(var(--prop-gap) * 1.5 / 4) calc(var(--prop-gap) * 2)
  calc(var(--prop-gap) * 1.5 / 4) var(--prop-gap);
  cursor: pointer;
  max-width: 200px;
  &:hover {
    border: 1px solid var(--color-blue-grey-400);
  }
  .accounts-manager-selected-account {
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--color-blue-grey-200);
    padding-right: var(--prop-gap);
    cursor: pointer;
    justify-content: center;
    overflow: hidden;
    .unique-text {
      white-space: nowrap;
      line-height: 21px;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .accounts-manager-selected-account-name {
      display: flex;
      column-gap: calc(var(--prop-gap) / 4);
      align-items: center;
      .address-copy {
        cursor: pointer;
        height: 16px;
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
