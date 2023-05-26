import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { BN } from '@polkadot/util';
import { Button, useNotifications } from 'components/UI';
import { toChainFormatAddress } from 'api/chainApi/utils/addressUtils';
import { TWithdrawBid } from 'api/restApi/auction/types';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { Table } from 'components/Table';
import { PagePaper } from 'components/PagePaper/PagePaper';
import ConfirmModal from 'components/ConfirmModal';
import GetKSMModal from 'components/GetKSMModal/GetKSMModal';
import { WithdrawDepositModal } from './Modals/WithdrawDeposit';
import { TransferFundsModal } from './Modals/SendFunds';
import config from 'config';
import { AccountInfo } from './types';
import NoAccountsIcon from 'static/icons/no-accounts.svg';
import { getAccountsColumns } from './columns';
import AccountContext from 'account/AccountContext';
import { MarketAccount as Account } from 'account/types';
import { useNavigate } from 'react-router-dom';

const testid = 'accounts-page';

enum AccountModal {
  create,
  importViaSeed,
  importViaJSON,
  importViaQRCode,
  sendFunds,
  withdrawDeposit,
  deleteLocalAccount,
  getKsmModal
}

export const AccountsPage = () => {
  const { setIsOpenConnectWalletModal } = useContext(
    AccountContext
  );
  const {
    accounts,
    fetchAccounts,
    isLoading,
    isLoadingDeposits,
    deleteLocalAccount,
    updateAccountsDeposits
  } = useAccounts();
  const [currentModal, setCurrentModal] = useState<AccountModal | undefined>();
  const [selectedAddress, setSelectedAddress] = useState<string>();
  const navigate = useNavigate();
  const deviceSize = useDeviceSize();
  const { chainProperties, currentChainId } = useApi();
  const { info } = useNotifications();

  useEffect(() => {
    if (!isLoading && !accounts.length) {
      navigate(`/${currentChainId}/market`);
    }
  }, [accounts, isLoading]);

  useEffect(() => {
    // void updateAccountsDeposits();
  }, [updateAccountsDeposits]);

  useEffect(() => {
    setCurrentModal(undefined);
    void updateAccountsDeposits();
  }, [currentChainId]);

  const formatAddress = useCallback((address: string) => {
    return toChainFormatAddress(address, chainProperties?.SS58Prefix || 0);
  }, [chainProperties?.SS58Prefix]);

  const onAccountActionClick = useCallback((modal: AccountModal) => (address: string) => () => {
    setCurrentModal(modal);
    setSelectedAddress(address);
  }, []);

  const onGetClick = useCallback(() => {
    switch (chainProperties?.token) {
      case 'OPL':
        window.open('https://t.me/unique2faucet_opal_bot', '_blank', 'noopener');
        break;
      case 'QUARTZ':
        window.open('https://www.mexc.com/exchange/QTZ_USDT', '_blank', 'noopener');
        break;
      case 'UNIQUE':
        window.open('https://www.huobi.com/en-us/exchange/unq_usdt', '_blank', 'noopener');
        break;
      default:
        break;
    }
  }, []);

  const filteredAccounts: AccountInfo[] = useMemo(() => {
    const reduceAccounts = (acc: AccountInfo[], account: Account) => {
      acc.push(account);
      if (!account.deposits) return acc;

      const { sponsorshipFee, bids } = account.deposits;
      const { leader, withdraw } = bids || { leader: [], withdraw: [] };

      if ((!sponsorshipFee?.isZero() || leader.length !== 0 || withdraw.length !== 0)) {
        const getTotalAmount = (acc: BN, bid: TWithdrawBid) => acc.add(new BN(bid.amount));

        // add row with deposit info only on big screens
        if (deviceSize !== DeviceSize.sm) {
          acc.push({
            ...account,
            deposit: (sponsorshipFee || new BN(0))
              .add(withdraw.reduce(getTotalAmount, new BN(0)))
              .add(leader.reduce(getTotalAmount, new BN(0)))
          });
        } else {
          acc[acc.length - 1] = {
            ...account,
            deposit: (sponsorshipFee || new BN(0))
              .add(withdraw.reduce(getTotalAmount, new BN(0)))
              .add(leader.reduce(getTotalAmount, new BN(0)))
          };
        }
      }
      return acc;
    };

    return accounts.reduce(reduceAccounts, []);
  }, [accounts, deviceSize]);

  const onChangeAccountsFinish = useCallback(async () => {
    setCurrentModal(undefined);
    await fetchAccounts();
  }, [fetchAccounts]);

  const onModalClose = useCallback(() => {
    setCurrentModal(undefined);
  }, []);

  const deleteLocalAccountConfirmed = useCallback(() => {
    deleteLocalAccount(selectedAddress || '');
    info('Account successfully deleted');
    void onChangeAccountsFinish();
  }, [selectedAddress, deleteLocalAccount, onChangeAccountsFinish]);

  return (<PagePaper>
    <AccountPageWrapper>
      <Row>
        <CreateAccountButton
          testid={`${testid}-create-substrate-button`}
          title={'Сonnect or create wallet'}
          onClick={() => setIsOpenConnectWalletModal(true)}
        />
      </Row>
      <TableWrapper>
        <Table<AccountInfo>
          columns={getAccountsColumns({
            isSmallDevice: deviceSize === DeviceSize.sm,
            formatAddress,
            onShowSendFundsModal: onAccountActionClick(AccountModal.sendFunds),
            onShowWithdrawDepositModal: onAccountActionClick(AccountModal.withdrawDeposit),
            onShowDeleteLocalAccountModal: onAccountActionClick(AccountModal.deleteLocalAccount),
            onGetClick,
            tokenSymbol: chainProperties?.token || '',
            scanUrl: currentChainId ? config.blockchains[currentChainId]?.scanUrl : ''
          })}
          data={filteredAccounts}
          loading={isLoading || isLoadingDeposits}
          emptyIconProps={{ file: NoAccountsIcon }}
          idColumnName={'address'}
        />
      </TableWrapper>
      <TransferFundsModal
        isVisible={currentModal === AccountModal.sendFunds}
        onFinish={onModalClose}
        senderAddress={selectedAddress}
        testid={`${testid}-transfer-funds-modal`}
      />
      <WithdrawDepositModal
        isVisible={currentModal === AccountModal.withdrawDeposit}
        onFinish={onChangeAccountsFinish}
        address={selectedAddress}
        testid={`${testid}-withdraw-modal`}
      />
      <ConfirmModal
        isVisible={currentModal === AccountModal.deleteLocalAccount}
        onCancel={onModalClose}
        onConfirm={deleteLocalAccountConfirmed}
        headerText={'Delete local account'}
        testid={`${testid}-delete-account-modal`}
      >
        <p data-testid={`${testid}-delete-account-modal-content`}>Are you sure, you want to perform this action? You won&apos;t be able to recover this account in future.</p>
      </ConfirmModal>
    </AccountPageWrapper>
    {config.rampApiKey && currentModal === AccountModal.getKsmModal && <GetKSMModal key={'modal-accounts-getKsm'} onClose={onModalClose}/>}
  </PagePaper>);
};

const AccountPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) * 2);
  width: 100%;
  .unique-table-data-row {
    height: fit-content;
  }

  @media (max-width: 640px) {
    .unique-modal-wrapper .unique-modal {
      width: calc(520px - var(--prop-gap) * 3);
    }
  }

  @media (max-width: 567px) {
    .unique-modal-wrapper .unique-modal {
      width: calc(288px - var(--prop-gap) * 2);
      padding: 24px 16px;
    }
  }
`;

const Row = styled.div`
  display: flex;
  column-gap: var(--gap);
  width: 100%;

  @media (max-width: 1024px) {
    flex-direction: column;
    row-gap: var(--gap);
    
    div[class^=DropdownMenu] {
      width: 100%;
      button {
        width: 100%;
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

const TableWrapper = styled.div`
  position: relative;
`;
