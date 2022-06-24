import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AccountsManager, Button, Text } from '@unique-nft/ui-kit';

import { useAccounts } from 'hooks/useAccounts';
import { Account } from 'account/AccountContext';
import { BalanceOption } from './types';
import { useApi } from 'hooks/useApi';
import DefaultAvatar from 'static/icons/default-avatar.svg';
import { Avatar } from 'components/Avatar/Avatar';
import { NotificationSeverity } from 'notification/NotificationContext';
import { useNotification } from 'hooks/useNotification';
import { toChainFormatAddress } from 'api/chainApi/utils/addressUtils';
import GetKSMModal from 'components/GetKSMModal/GetKSMModal';
import { formatKusamaBalance } from 'utils/textUtils';

const tokenSymbol = 'KSM';

function widgetAvatarRender(accountAddress: string) {
  return (<Avatar size={24} src={DefaultAvatar} address={accountAddress} />);
}

export const WalletManager: FC = () => {
  const { selectedAccount, accounts, isLoading, fetchAccounts, changeAccount } = useAccounts();
  const [isGetKsmOpened, setIsGetKsmOpened] = useState(false);
  const navigate = useNavigate();
  const { chainData } = useApi();
  const { push } = useNotification();
  const formatAddress = useCallback((address: string) => {
    return toChainFormatAddress(address, chainData?.properties.ss58Format || 0);
  }, [chainData?.properties.ss58Format]);

  const widgetAccounts = useMemo(() => accounts.map((account) => (
    { name: account.meta.name, ...account, address: formatAddress(account.address), substrateAddress: account?.address })
  ), [accounts, formatAddress]);
  const widgetSelectedAccount = useMemo(() => (
    { name: selectedAccount?.meta.name, ...selectedAccount, address: selectedAccount?.address ? formatAddress(selectedAccount.address) : '', substrateAddress: selectedAccount?.address }
  ), [selectedAccount, formatAddress]);
  const widgetAccountChange = useCallback((account) => {
    changeAccount({ ...account, address: account.substrateAddress } as Account);
  }, [changeAccount]);

  const onCopyAddress = useCallback((account: string) => {
    navigator.clipboard.writeText(formatAddress(account)).then(() => {
      push({ severity: NotificationSeverity.success, message: 'Address copied' });
    });
  }, [formatAddress, push]);

  useEffect(() => {
    (async () => {
      await fetchAccounts();
    })();
  }, [fetchAccounts]);

  const onCreateAccountClick = useCallback(() => {
    navigate('/accounts');
  }, [navigate]);

  const currentBalance: BalanceOption = useMemo(() => {
    return { value: selectedAccount?.balance?.KSM?.toString() || '0', chain: chainData?.systemChain || '' };
  }, [selectedAccount, chainData?.systemChain]);

  const closeModal = useCallback(() => {
    setIsGetKsmOpened(false);
  }, [setIsGetKsmOpened]);

  const openModal = useCallback(() => {
    setIsGetKsmOpened(true);
  }, [setIsGetKsmOpened]);

  if (!isLoading && accounts.length === 0) {
    return (
      <Button title={'Connect or create account'} onClick={onCreateAccountClick} />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end'
      }}
    >
      <AccountsManager
        accounts={widgetAccounts}
        activeNetwork={{
          icon: {
            name: 'chain-quartz',
            size: 40
          },
          id: 'quartz',
          name: 'Quartz'
        }}
        balance={formatKusamaBalance(currentBalance.value)}
        deposit={selectedAccount?.deposits?.sponsorshipFee?.toString()}
        depositDescription={
          <>
            <Text color='grey-500' size='xs'>The total market deposit for participation in auctions and sponsorship. Use the “Manage my balance” section to withdraw.</Text>
            <GetKsmButton
              title={'Get KSM'}
              size={'middle'}
              role={'outlined'}
              wide
              onClick={openModal}
            />
          </>
        }
        manageBalanceLinkTitle='Manage my balance'
        networks={[]}
        onAccountChange={widgetAccountChange}
        onCopyAddressClick={onCopyAddress}
        onManageBalanceClick={onCreateAccountClick}
        onNetworkChange={function noRefCheck() { }}
        selectedAccount={widgetSelectedAccount}
        symbol={tokenSymbol}
        avatarRender={widgetAvatarRender}
      />
      {isGetKsmOpened && <GetKSMModal key={'modal-getKsm'} onClose={closeModal}/>}
    </div>
  );
};

const GetKsmButton = styled(Button)`
  margin: 8px 0;
`;
