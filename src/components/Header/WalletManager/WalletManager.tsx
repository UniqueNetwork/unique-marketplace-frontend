import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AccountsManager, Button, Text, useNotifications } from '@unique-nft/ui-kit';

import { useAccounts } from 'hooks/useAccounts';
import { Account } from 'account/AccountContext';
import { BalanceOption } from './types';
import { useApi } from 'hooks/useApi';
import DefaultAvatar from 'static/icons/default-avatar.svg';
import { Avatar } from 'components/Avatar/Avatar';
import { toChainFormatAddress } from 'api/chainApi/utils/addressUtils';
import GetKSMModal from 'components/GetKSMModal/GetKSMModal';
import { formatKusamaBalance } from 'utils/textUtils';
import BalanceSkeleton from '../../Skeleton/BalanceSkeleton';
import config from '../../../config';

const tokenSymbol = 'KSM';

function widgetAvatarRender(accountAddress: string) {
  return (<Avatar size={24} src={DefaultAvatar} address={accountAddress} />);
}

export const WalletManager: FC = () => {
  const { selectedAccount, accounts, isLoading, fetchAccounts, changeAccount } = useAccounts();
  const [isOpen, setIsOpen] = useState(false);
  const [isGetKsmOpened, setIsGetKsmOpened] = useState(false);
  const navigate = useNavigate();
  const { chainData } = useApi();
  const { info } = useNotifications();
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
      info(
        'Address copied',
        { name: 'success', size: 32, color: 'var(--color-additional-light)' }
      );
    });
  }, [formatAddress, info]);

  useEffect(() => {
    (async () => {
      await fetchAccounts();
    })();
  }, [fetchAccounts]);

  const onCreateAccountClick = useCallback(() => {
    navigate('/accounts');
    setIsOpen(false);
  }, [navigate]);

  const currentBalance: BalanceOption = useMemo(() => {
    return { value: selectedAccount?.balance?.KSM?.toString() || '0', chain: chainData?.systemChain || '' };
  }, [selectedAccount, chainData?.systemChain]);

  const closeModal = useCallback(() => {
    setIsGetKsmOpened(false);
  }, [setIsGetKsmOpened]);

  const openModal = useCallback(() => {
    setIsGetKsmOpened(true);
    setIsOpen(false);
  }, [setIsGetKsmOpened]);

  const formattedAccountDeposit = useMemo(() => {
    if (!selectedAccount?.deposits?.sponsorshipFee || selectedAccount?.deposits?.sponsorshipFee?.toString() === '0') {
      return undefined;
    }
    return formatKusamaBalance(selectedAccount?.deposits?.sponsorshipFee?.toString());
      }, [selectedAccount?.deposits]);

  if (!isLoading && accounts.length === 0) {
    return (
      <Button title={'Connect or create account'} onClick={onCreateAccountClick} />
    );
  }

  if (isLoading) return <BalanceSkeleton />;

  return (
    <WalletManagerWrapper>
      <AccountsManager
        open={isOpen}
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
        deposit={formattedAccountDeposit}
        depositDescription={
          <>
            {formattedAccountDeposit && <Text color='grey-500' size='xs'>The total market deposit for participation in auctions and
              sponsorship. <br/> Use the “Manage my balance” section to withdraw.</Text>}
            {config.rampApiKey && <GetKsmButton
              title={'Get KSM'}
              size={'middle'}
              role={'outlined'}
              wide
              onClick={openModal}
            />}
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
        onOpenChange={setIsOpen}
      />
      {isGetKsmOpened && config.rampApiKey && <GetKSMModal key={'modal-getKsm'} onClose={closeModal}/>}
    </WalletManagerWrapper>
  );
};

const GetKsmButton = styled(Button)`
  margin: 8px 0;
`;

const WalletManagerWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  & > .unique-dropdown .dropdown-options.right {
    @media (max-width: 567px) {
      position: fixed;
      width: 100vw;
      left: 0;
      height: 100vh;
      top: 86px;
      border: none;
      box-shadow: none;
      padding: 0;
    }
  }  
`;
