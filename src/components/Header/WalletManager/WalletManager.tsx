import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { BN } from '@polkadot/util';
import { AccountsManager, Button, INetwork, Text, useNotifications } from '@unique-nft/ui-kit';

import { toChainFormatAddress } from 'api/uniqueSdk/utils/addressUtils';
import { useAccounts } from 'hooks/useAccounts';
import { Account } from 'account/AccountContext';
import { Avatar } from 'components/Avatar/Avatar';
import GetKSMModal from 'components/GetKSMModal/GetKSMModal';
import { BalanceOption } from './types';
import { useApi } from 'hooks/useApi';
import DefaultAvatar from 'static/icons/default-avatar.svg';
import { TWithdrawBid } from 'api/restApi/auction/types';
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
  const { chainData, settings, currentChainId, onChangeChainId } = useApi();
  const { info } = useNotifications();
  const navigate = useNavigate();

  const formatAddress = useCallback((address: string) => {
    return toChainFormatAddress(address, chainData?.SS58Prefix || 0);
  }, [chainData?.SS58Prefix]);

  const networks: INetwork[] = useMemo(() => Object.keys(settings?.blockchains || {}).map<INetwork>((id) => ({
    id,
    name: settings?.blockchains[id]?.chainName || '',
    icon: {
      name: `chain-${id.toLowerCase()}`,
      size: 40
    }
  })), [settings]);

  const currentNetwork = useMemo(() => networks.find(({ id }) => id === currentChainId), [networks, currentChainId]);

  const onNetworkChange = useCallback((network: INetwork) => {
    onChangeChainId(network.id);
  }, [onChangeChainId]);

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
    return { value: selectedAccount?.balance?.KSM?.toString() || '0', chain: chainData?.token || '' };
  }, [selectedAccount, chainData?.token]);

  const closeModal = useCallback(() => {
    setIsGetKsmOpened(false);
  }, [setIsGetKsmOpened]);

  const openModal = useCallback(() => {
    setIsGetKsmOpened(true);
    setIsOpen(false);
  }, [setIsGetKsmOpened]);

  const formattedAccountDeposit = useMemo(() => {
    if (!selectedAccount?.deposits) {
      return undefined;
    }

    const { sponsorshipFee, bids } = selectedAccount.deposits;
    const { leader, withdraw } = bids || { leader: [], withdraw: [] };
    if ((sponsorshipFee?.isZero() && leader.length === 0 && withdraw.length === 0)) {
      return undefined;
    }

    const getTotalAmount = (acc: BN, bid: TWithdrawBid) => acc.add(new BN(bid.amount));
    const deposit = (sponsorshipFee || new BN(0))
    .add(withdraw.reduce(getTotalAmount, new BN(0)))
    .add(leader.reduce(getTotalAmount, new BN(0)));
    return formatKusamaBalance(deposit.toString());
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
        activeNetwork={currentNetwork}
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
        networks={networks}
        onAccountChange={widgetAccountChange}
        onCopyAddressClick={onCopyAddress}
        onManageBalanceClick={onCreateAccountClick}
        onNetworkChange={onNetworkChange}
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
