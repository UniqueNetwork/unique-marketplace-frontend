import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';
import { Button, Text } from '@unique-nft/ui-kit';

import { useAccounts } from '../../../hooks/useAccounts';
import { DropdownSelect, DropdownSelectProps } from './AccountSelect/DropdownSelect';
import { Account } from '../../../account/AccountContext';
import Loading from '../../Loading';
import { formatKusamaBalance } from '../../../utils/textUtils';
import GearIcon from '../../../static/icons/gear.svg';
import { BalanceOption } from './types';
import useDeviceSize, { DeviceSize } from '../../../hooks/useDeviceSize';
import { BlueGrey200 } from '../../../styles/colors';
import { Icon } from '../../Icon/Icon';
import { useApi } from '../../../hooks/useApi';
import AccountCard from '../../Account/Account';

const tokenSymbol = 'KSM';

export const WalletManager: FC = () => {
  const { selectedAccount, accounts, isLoading, fetchAccounts, changeAccount } = useAccounts();
  const deviceSize = useDeviceSize();
  const gearActive = window.location.pathname !== '/myWallets';
  const navigate = useNavigate();
  const { chainData } = useApi();

  useEffect(() => {
    (async () => {
      await fetchAccounts();
    })();
  }, [fetchAccounts]);

  const onCreateAccountClick = useCallback(() => {
    navigate('/myWallets');
  }, [navigate]);

  const currentBalance: BalanceOption = useMemo(() => {
    return { value: selectedAccount?.balance?.KSM?.toString() || '0', chain: chainData?.systemChain || '' };
  }, [selectedAccount, chainData?.systemChain]);

  if (!isLoading && accounts.length === 0) {
   return (
     <Button title={'Connect or create account'} onClick={onCreateAccountClick} />
    );
  }

  if (deviceSize === DeviceSize.sm) {
    return (
      <WalletManagerWrapper>
        {isLoading && <Loading />}
        <AccountSelect
          renderOption={AccountWithBalanceOptionCard}
          onChange={changeAccount}
          options={accounts || []}
          value={selectedAccount}
        />
      </WalletManagerWrapper>
    );
  }

  return (
    <WalletManagerWrapper>
      {isLoading && <Loading />}
      <AccountSelect
        renderOption={AccountOptionCard}
        onChange={changeAccount}
        options={accounts || []}
        value={selectedAccount}
      />
      <Divider />
      <BalanceCard {...currentBalance} />
      {deviceSize === DeviceSize.lg && <><Divider />
        <SettingsButtonWrapper $gearActive={gearActive}>
          <Link to={'/myWallets'}>
            <Icon path={GearIcon} />
          </Link>
        </SettingsButtonWrapper></>}
    </WalletManagerWrapper>
  );
};

const AccountOptionCard: FC<Account> = (account) => {
  return (<AccountOptionWrapper>
    <AccountCard accountName={account.meta.name || ''}
      accountAddress={account.address}
      canCopy={false}
      isShort
    />
  </AccountOptionWrapper>);
};

const AccountWithBalanceOptionCard: FC<Account> = (account) => {
  return (<AccountOptionWrapper>
    <AccountCard accountName={`${formatKusamaBalance(account.balance?.KSM?.toString() || '0')} ${tokenSymbol}`}
      accountAddress={account.address}
      canCopy={false}
      isShort
    />
  </AccountOptionWrapper>);
};

const BalanceCard = (balance: BalanceOption) => {
  return (<BalanceOptionWrapper>
    <Text size={'m'} weight={'medium'} >{`${formatKusamaBalance(balance.value)} ${tokenSymbol}`}</Text>
    <Text size={'s'} color={'grey-500'} >{balance.chain}</Text>
  </BalanceOptionWrapper>);
};

const AccountSelect = styled((props: DropdownSelectProps<Account>) => DropdownSelect<Account>(props))`
  height: 100%;
  @media(max-width: 768px) {
    div[class^=WalletManager__AccountOptionPropertyWrapper] {
      display: none;
    }
  }
`;

const AccountOptionWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
  cursor: pointer;
  align-items: center;
`;

const BalanceOptionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;
  padding: calc(var(--gap) / 2) var(--gap);
`;

const SettingsButtonWrapper = styled.div <{ $gearActive?: boolean }>`
  a {
    margin-right: 0 !important;
    height: 100%;
    padding: 0 var(--gap);
    align-items: center;
    display: flex;
    pointer-events: ${(props) => (props.$gearActive ? 'default' : 'none')};
    cursor: ${(props) => (props.$gearActive ? 'pointer' : 'default')};
  }

  span {
    display: flex;
    align-items: center;
    color: ${(props) => (props.$gearActive ? 'var(--color-primary-500)' : 'var(--color-grey-500)')};
  }
`;

const WalletManagerWrapper = styled.div`
  border: 1px solid ${BlueGrey200};
  box-sizing: border-box;
  border-radius: 8px;
  display: flex;
  position: relative;
  @media(max-width: 768px) {
    div[class^=Account__AddressRow] {
      display: none;
    }
  }
`;

const Divider = styled.div`
  width: 1px;
  margin: calc(var(--gap) / 2) 0;
  border-left: 1px solid ${BlueGrey200};
`;
