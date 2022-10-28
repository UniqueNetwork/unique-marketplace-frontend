import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { BN } from '@polkadot/util';
import { Dropdown, Button } from 'components/UI';
import { toChainFormatAddress } from 'api/uniqueSdk/utils/addressUtils';
import { TWithdrawBid } from 'api/restApi/auction/types';
import { Account } from '@unique-nft/accounts';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { Table } from 'components/Table';
import { PagePaper } from 'components/PagePaper/PagePaper';
import { TextInput } from 'components/TextInput/TextInput';
import ConfirmModal from 'components/ConfirmModal';
import GetKSMModal from 'components/GetKSMModal/GetKSMModal';
import { CreateAccountModal } from './Modals/CreateAccount';
import { ImportViaSeedAccountModal } from './Modals/ImportViaSeed';
import { ImportViaJSONAccountModal } from './Modals/ImportViaJson';
import { ImportViaQRCodeAccountModal } from './Modals/ImportViaQRCode';
import { WithdrawDepositModal } from './Modals/WithdrawDeposit';
import { TransferFundsModal } from './Modals/SendFunds';
import { AdditionalLight, BlueGrey300, Primary100 } from 'styles/colors';
import config from 'config';
import { AccountInfo } from './types';
import NoAccountsIcon from 'static/icons/no-accounts.svg';
import { getAccountsColumns } from './columns';

const testid = 'accounts-page';

const caretDown = { name: 'carret-down', size: 16, color: AdditionalLight };

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
  const {
    accounts,
    fetchAccounts,
    isLoading,
    isLoadingDeposits,
    deleteLocalAccount,
    updateAccountsDeposits
  } = useAccounts();
  const [searchString, setSearchString] = useState<string>('');
  const [currentModal, setCurrentModal] = useState<AccountModal | undefined>();
  const [selectedAddress, setSelectedAddress] = useState<string>();
  const [isDropdownOpened, setIsDropdownOpened] = useState(false);
  const deviceSize = useDeviceSize();
  const { chainData, currentChainId } = useApi();

  useEffect(() => {
    void updateAccountsDeposits();
  }, [updateAccountsDeposits]);

  useEffect(() => {
    setSearchString('');
    setCurrentModal(undefined);
    void updateAccountsDeposits();
  }, [currentChainId]);

  const formatAddress = useCallback((address: string) => {
    return toChainFormatAddress(address, Number(chainData?.ss58Format?.toHuman()) || 0);
  }, [chainData?.ss58Format]);

  const onActionClick = useCallback((modal: AccountModal) => () => {
    setCurrentModal(modal);
  }, []);

  const onAccountActionClick = useCallback((modal: AccountModal) => (address: string) => () => {
    setCurrentModal(modal);
    setSelectedAddress(address);
  }, []);

  const onShowGetKsmModal = useCallback(() => {
    if (!config.rampApiKey) return;
    setCurrentModal(AccountModal.getKsmModal);
  }, []);

  const onSearchStringChange = useCallback((value: string) => {
    setSearchString(value);
  }, []);

  const filteredAccounts: AccountInfo[] = useMemo(() => {
    const reduceAccounts = (acc: AccountInfo[], account: Account) => {
      acc.push({
        address: account.getAddress(),
        name: account.name || '',
        balance: account.balance
      });
      if (!account.deposits) return acc;

      const { sponsorshipFee, bids } = account.deposits;
      const { leader, withdraw } = bids || { leader: [], withdraw: [] };

      if ((!sponsorshipFee?.isZero() || leader.length !== 0 || withdraw.length !== 0)) {
        const getTotalAmount = (acc: BN, bid: TWithdrawBid) => acc.add(new BN(bid.amount));

        // add row with deposit info only on big screens
        if (deviceSize !== DeviceSize.sm) {
          acc.push({
            address: account.getAddress(),
            name: account.name || '',
            deposit: (sponsorshipFee || new BN(0))
              .add(withdraw.reduce(getTotalAmount, new BN(0)))
              .add(leader.reduce(getTotalAmount, new BN(0)))
          });
        } else {
          acc[acc.length - 1] = {
            address: account.getAddress(),
            name: account.name || '',
            balance: account.balance,
            deposit: (sponsorshipFee || new BN(0))
              .add(withdraw.reduce(getTotalAmount, new BN(0)))
              .add(leader.reduce(getTotalAmount, new BN(0)))
          };
        }
      }
      return acc;
    };

    if (!searchString) {
      return accounts.reduce(reduceAccounts, []);
    }
    return accounts
    .filter(
      (account) =>
        formatAddress(account.getAddress()).toLowerCase().includes(searchString.trim().toLowerCase()) ||
        account.name?.toLowerCase().includes(searchString.trim().toLowerCase())
    )
    .reduce(reduceAccounts, []);
  }, [accounts, searchString, formatAddress, deviceSize]);

  const onChangeAccountsFinish = useCallback(async () => {
    setCurrentModal(undefined);
    await fetchAccounts();
  }, [fetchAccounts]);

  const onModalClose = useCallback(() => {
    setCurrentModal(undefined);
  }, []);

  const deleteLocalAccountConfirmed = useCallback(() => {
    deleteLocalAccount(selectedAddress || '');
    void onChangeAccountsFinish();
  }, [selectedAddress, deleteLocalAccount, onChangeAccountsFinish]);

  return (<PagePaper>
    <AccountPageWrapper>
      <Row>
        <CreateAccountButton
          testid={`${testid}-create-substrate-button`}
          title={'Create substrate account'}
          onClick={onActionClick(AccountModal.create)}
        />
        <DropdownStyled
          dropdownRender={() => <DropdownMenu>
            <DropdownMenuItem onClick={onActionClick(AccountModal.importViaSeed)} data-testid={`${testid}-seed-button`}>Seed phrase</DropdownMenuItem>
            <DropdownMenuItem onClick={onActionClick(AccountModal.importViaJSON)} data-testid={`${testid}-json-file-button`}>Backup JSON file</DropdownMenuItem>
            <DropdownMenuItem onClick={onActionClick(AccountModal.importViaQRCode)} data-testid={`${testid}-qr-button`}>QR-code</DropdownMenuItem>
          </DropdownMenu>}
          onOpenChange={setIsDropdownOpened}
        >
          <AddAccountButton
            testid={`${testid}-add-via-button`}
            title={'Add account via'}
            role={'primary'}
            iconRight={caretDown}
            isDropdownOpened={isDropdownOpened}
          />
        </DropdownStyled>
        <SearchInputWrapper>
          <SearchInputStyled
            testid={`${testid}-search`}
            placeholder={'Account'}
            iconLeft={{ name: 'magnify', size: 18 }}
            value={searchString}
            onChange={onSearchStringChange}
          />
        </SearchInputWrapper>
      </Row>
      <TableWrapper>
        <Table<AccountInfo>
          columns={getAccountsColumns({
            isSmallDevice: deviceSize === DeviceSize.sm,
            formatAddress,
            onShowSendFundsModal: onAccountActionClick(AccountModal.sendFunds),
            onShowWithdrawDepositModal: onAccountActionClick(AccountModal.withdrawDeposit),
            onShowDeleteLocalAccountModal: onAccountActionClick(AccountModal.deleteLocalAccount),
            onShowGetKsmModal,
            scanUrl: currentChainId ? config.blockchains[currentChainId]?.scanUrl : ''
          })}
          data={filteredAccounts}
          loading={isLoading || isLoadingDeposits}
          emptyIconProps={searchString ? { name: 'magnifier-found' } : { file: NoAccountsIcon }}
          idColumnName={'address'}
        />
      </TableWrapper>
      <CreateAccountModal
        isVisible={currentModal === AccountModal.create}
        onFinish={onChangeAccountsFinish}
        onClose={onModalClose}
        testid={`${testid}-create-modal`}
      />
      <ImportViaSeedAccountModal
        isVisible={currentModal === AccountModal.importViaSeed}
        onFinish={onChangeAccountsFinish}
        onClose={onModalClose}
        testid={`${testid}-import-via-seed-modal`}
      />
      <ImportViaJSONAccountModal
        isVisible={currentModal === AccountModal.importViaJSON}
        onFinish={onChangeAccountsFinish}
        onClose={onModalClose}
        testid={`${testid}-import-via-json-modal`}
      />
      <ImportViaQRCodeAccountModal
        isVisible={currentModal === AccountModal.importViaQRCode}
        onFinish={onChangeAccountsFinish}
        onClose={onModalClose}
        testid={`${testid}-import-via-qr-modal`}
      />
      <TransferFundsModal
        isVisible={currentModal === AccountModal.sendFunds}
        onFinish={onModalClose}
        senderAddress={selectedAddress}
        testid={`${testid}-transfer-funds-modal`}
      />
      <WithdrawDepositModal
        isVisible={currentModal === AccountModal.withdrawDeposit}
        onFinish={onChangeAccountsFinish}
        onClose={onModalClose}
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

const SearchInputWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: flex-end;
  
  @media (max-width: 1024px) {
    justify-content: space-between;
    .unique-input-text {
      width: 100%;
      flex-grow: 1;
    }
  }
`;

const SearchInputStyled = styled(TextInput)`
  flex-basis: 720px;
`;

const CreateAccountButton = styled(Button)`
  width: 243px;
  @media (max-width: 1024px) {
    width: 100%;
  }
`;

const DropdownStyled = styled(Dropdown)`
  .dropdown-options {
    padding: 0;
    width: 100%;
  }
  @media (max-width: 1024px) {
    width: 100%;
  }
`;

const AddAccountButton = styled(Button)<{ isDropdownOpened: boolean }>`
  width: 196px;
  @media (max-width: 1024px) {
    width: 100%;
  }
  svg {
    transform: ${({ isDropdownOpened }) => isDropdownOpened ? 'rotate(180deg);' : 'rotate(0deg);'};
    transition: transform 0.3s;
  }
`;

const TableWrapper = styled.div`
  position: relative;
`;

const DropdownMenu = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const DropdownMenuItem = styled.div`
  padding: var(--gap);
  cursor: pointer;
  &:hover {
    background: var(--color-primary-100);
    color: var(--color-primary-500);
  }
  &:active {
    background: ${BlueGrey300};
    color: ${Primary100};
  }
`;
