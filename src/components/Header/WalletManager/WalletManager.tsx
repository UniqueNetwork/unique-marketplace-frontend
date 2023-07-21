import React, { FC, useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import config from 'config';

import { BN } from '@polkadot/util';

import { INetwork } from '@unique-nft/ui-kit';

import { formatBalance } from 'utils/textUtils';
import { Text, useNotifications, Button } from 'components/UI';
import { AccountsManager, IAccount } from 'components/UI/widgets/AccountsManager';
import { Avatar } from 'components/Avatar/Avatar';
import GetKSMModal from 'components/GetKSMModal/GetKSMModal';
import { useAccounts } from 'hooks/useAccounts';
import { useApi } from 'hooks/useApi';

import DefaultAvatar from 'static/icons/default-avatar.svg';
import { TWithdrawBid } from 'api/restApi/auction/types';
import BalanceSkeleton from '../../Skeleton/BalanceSkeleton';
import AccountContext from 'account/AccountContext';
import { ChainSwitcher } from './ChainSwitcher/ChainSwithcher';

const fractionDigits = 4;

function widgetAvatarRender(accountAddress: string) {
  return (<Avatar size={24} src={DefaultAvatar} address={accountAddress} />);
}

export const WalletManager: FC = () => {
  const { setIsOpenConnectWalletModal } = useContext(AccountContext);
  const { selectedAccount, accounts, isLoading, changeAccount } = useAccounts();
  const [isOpen, setIsOpen] = useState(false);
  const [isGetKsmOpened, setIsGetKsmOpened] = useState(false);
  const { chainProperties, currentChainId, onChangeChainId, api } = useApi();
  const { info } = useNotifications();
  const navigate = useNavigate();

  const networks: INetwork[] = useMemo(() => Object.keys(config?.blockchains || {}).reverse().map<INetwork>((id) => ({
    id,
    name: config?.blockchains[id]?.name || '',
    icon: {
      name: `chain-${id.toLowerCase()}`,
      size: 40
    }
  })), []);

  const currentNetwork = useMemo(() => networks.find(({ id }) => id === currentChainId), [networks, currentChainId]);

  const onNetworkChange = useCallback((network: INetwork) => {
    onChangeChainId(network.id);
    setIsOpen(false);
  }, [onChangeChainId]);

  const widgetSelectedAccount = useMemo(() => (
    { name: selectedAccount?.name, address: selectedAccount ? selectedAccount.address || selectedAccount.account.getAddress(chainProperties?.SS58Prefix) : '', substrateAddress: selectedAccount?.address }
  ), [selectedAccount, chainProperties?.SS58Prefix]);

  const widgetAccountChange = useCallback(({ address }: IAccount) => {
    const account = accounts.find((account) => account.address === address);
    if (!account) return;
    changeAccount(account);
  }, [accounts, changeAccount]);

  const onCopyAddress = useCallback((_: string) => {
    info(
      'Address copied',
      { name: 'success', size: 32, color: 'var(--color-additional-light)' }
    );
  }, []);

  const onManageAccountsClick = useCallback(() => {
    navigate('/accounts');
    setIsOpen(false);
  }, [navigate]);

  const onCreateAccountClick = useCallback(() => {
    setIsOpenConnectWalletModal(true);
    setIsOpen(false);
  }, [navigate]);

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
    return formatBalance(deposit.toString(), fractionDigits);
  }, [selectedAccount?.deposits]);

  if (!isLoading && !selectedAccount) {
    return (<>
      <Button title={'Connect'} onClick={onCreateAccountClick} />
      <ChainSwitcher
        activeChain={currentNetwork}
        chains={networks}
        onChainChange={onNetworkChange}
      />
    </>);
  }

  if (isLoading || !api) return <BalanceSkeleton />;

  return (
    <WalletManagerWrapper>
      <AccountsManager
        open={isOpen}
        accounts={accounts}
        activeNetwork={currentNetwork}
        balance={formatBalance(selectedAccount?.balance?.parsed || '0', fractionDigits)}
        deposit={formattedAccountDeposit}
        depositDescription={
          <>
            {formattedAccountDeposit && <Text color='grey-500' weight={'light'} size='xs'>The total market deposit for participation in auctions and
              sponsorship. <br/> Use the “Manage accounts” section to withdraw.</Text>}
          </>
        }
        networks={networks}
        onAccountChange={widgetAccountChange}
        onCopyAddressClick={onCopyAddress}
        onManageBalanceClick={onManageAccountsClick}
        onNetworkChange={onNetworkChange}
        selectedAccount={widgetSelectedAccount}
        symbol={chainProperties?.token || ''}
        avatarRender={widgetAvatarRender}
        onOpenChange={setIsOpen}
      />
      {isGetKsmOpened && config.rampApiKey && <GetKSMModal key={'modal-getKsm'} onClose={closeModal}/>}
    </WalletManagerWrapper>
  );
};

const GetKsmButton = styled(Button)`
  margin-top: 12px;
  height: 32px;
  font-size: 14px;
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
