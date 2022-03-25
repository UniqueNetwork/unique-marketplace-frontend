import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import { Button, Text } from '@unique-nft/ui-kit';

import { useAccounts } from '../../../hooks/useAccounts';
import { DropdownSelect, DropdownSelectProps } from './AccountSelect/DropdownSelect';
import { Account } from '../../../account/AccountContext';
import Loading from '../../Loading';
import { formatKusamaBalance, shortcutText } from '../../../utils/textUtils';
import { Avatar } from '../../Avatar/Avatar';
import DefaultAvatar from '../../../static/icons/default-avatar.svg';
import GearIcon from '../../../static/icons/gear.svg';
import { BalanceOption } from './types';
import { useApi } from '../../../hooks/useApi';
import useDeviceSize, { DeviceSize } from '../../../hooks/useDeviceSize';
import { BlueGrey200 } from '../../../styles/colors';
import { Icon } from '../../Icon/Icon';

const tokenSymbol = 'KSM';

export const WalletManager: FC = () => {
  const { selectedAccount, accounts, isLoading, isLoadingBalances, fetchAccounts, changeAccount } = useAccounts();
  const { currentChain } = useApi();
  const deviceSize = useDeviceSize();
  const gearActive = window.location.pathname !== '/accounts';

  useEffect(() => {
    void fetchAccounts();
  }, [fetchAccounts]);

  const onOnChainChange = useCallback(() => {
    // TODO: change chain
  }, []);

  const onCreateAccountClick = useCallback(() => {
    // TODO: call creating account
  }, []);

  const currentBalance: BalanceOption = useMemo(() => {
    return { value: selectedAccount?.balance?.KSM?.toString() || '0', chain: currentChain };
  }, [selectedAccount, currentChain]);

  if (!isLoading && accounts.length === 0) {
 return (
   <Button title={'Сonnect or create account'} onClick={onCreateAccountClick} />
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
      <DropdownSelect<BalanceOption>
        renderOption={BalanceOptionCard}
        onChange={onOnChainChange}
        options={[]}
        value={currentBalance}
      />
      {isLoadingBalances && <Loading />}
      {deviceSize === DeviceSize.lg && <><Divider />
        <SettingsButtonWrapper $gearActive={gearActive}>
          <Link to={'/accounts'}>
            <Icon path={GearIcon} />
          </Link>
        </SettingsButtonWrapper></>}
    </WalletManagerWrapper>
  );
};

const AccountOptionCard = (account: Account) => {
  return (<AccountOptionWrapper>
    <Avatar size={24} src={DefaultAvatar}/>
    <AccountOptionPropertyWrapper>
      {account.meta?.name && <Text size={'m'} weight={'medium'} >{account.meta?.name}</Text>}
      <Text size={'s'} color={'grey-500'} >{shortcutText(account.address)}</Text>
    </AccountOptionPropertyWrapper>
  </AccountOptionWrapper>);
};

const BalanceOptionCard = (balance: BalanceOption) => {
  return (<BalanceOptionWrapper>
    <Text size={'m'} weight={'medium'} >{`${formatKusamaBalance(balance.value)} ${tokenSymbol}`}</Text>
    <Text size={'s'} color={'grey-500'} >{balance.chain.name}</Text>
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

const AccountOptionPropertyWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const BalanceOptionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;
`;

const SettingsButtonWrapper = styled.div <{ $gearActive?: boolean }>`
  a {
    margin-right: 0px !important;
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
`;

const Divider = styled.div`
  width: 1px;
  margin: calc(var(--gap) / 2) 0;
  border-left: 1px solid ${BlueGrey200};
`;
