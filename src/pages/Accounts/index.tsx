import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Dropdown, Icon, TableColumnProps, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { BN } from '@polkadot/util';

import { useAccounts } from 'hooks/useAccounts';
import { CreateAccountModal } from './Modals/CreateAccount';
import { ImportViaSeedAccountModal } from './Modals/ImportViaSeed';
import { ImportViaJSONAccountModal } from './Modals/ImportViaJson';
import { ImportViaQRCodeAccountModal } from './Modals/ImportViaQRCode';
import { TransferFundsModal } from './Modals/SendFunds';
import { Table } from '../../components/Table';
import { formatKusamaBalance } from '../../utils/textUtils';
import { PagePaper } from '../../components/PagePaper/PagePaper';
import { WithdrawDepositModal } from './Modals/WithdrawDeposit';
import { Account } from '../../account/AccountContext';
import { toChainFormatAddress } from '../../api/chainApi/utils/addressUtils';
import { useApi } from '../../hooks/useApi';
import AccountCard from '../../components/Account/Account';
import useDeviceSize, { DeviceSize } from '../../hooks/useDeviceSize';
import config from '../../config';
import { TWithdrawBid } from '../../api/restApi/auction/types';
import { TextInput } from '../../components/TextInput/TextInput';
import { AdditionalLight, Primary500 } from '../../styles/colors';
import AccountTooltip from './Tooltips/AccountTooltip';
import IconWithHint from './Tooltips/WithdrawTooltip';

const tokenSymbol = 'KSM';

type AccountsColumnsProps = {
  isShortAddress: boolean
  formatAddress(address: string): string
  onShowSendFundsModal(address: string): () => void
  onShowWithdrawDepositModal(address: string): () => void
};

const getAccountsColumns = ({ formatAddress, onShowSendFundsModal, onShowWithdrawDepositModal, isShortAddress }: AccountsColumnsProps): TableColumnProps[] => [
  {
    title: 'Account',
    width: '25%',
    field: 'accountInfo',
    iconRight: {
      name: 'question',
      size: 20,
      color: Primary500
    },
    render(accountInfo: AccountInfo) {
      if (accountInfo.deposit) return <></>;
      return (
        <AccountCellWrapper>
          <AccountCard accountName={accountInfo.name}
            accountAddress={accountInfo.address}
            canCopy
            isShort={isShortAddress}
          />
        </AccountCellWrapper>
      );
    }
  },
  {
    title: 'Balance',
    width: '25%',
    field: 'accountInfo',
    render(accountInfo: AccountInfo) {
      const { KSM } = accountInfo.balance || { KSM: accountInfo.deposit || 0 };
      const isDeposit = !!accountInfo.deposit;
      return (
        <BalancesWrapper>
          {!isDeposit && <Text>{`${formatKusamaBalance(KSM?.toString() || 0)} ${tokenSymbol}`}</Text>}
          {isDeposit && (<>
            <Text color={'grey-500'} size={'s'}>{`${formatKusamaBalance(KSM?.toString() || 0)} ${tokenSymbol}`}</Text>
            <Text color={'grey-500'} size={'s'}>market deposit</Text>
          </>)}
        </BalancesWrapper>
      );
    }
  },
  {
    title: 'Block explorer',
    width: '25%',
    field: 'accountInfo',
    render(accountInfo: AccountInfo) {
      if (accountInfo.deposit) return <></>;
      return (
        <LinksWrapper>
          <LinkStyled
            target={'_blank'}
            rel={'noreferrer'}
            href={`${config.scanUrl}account/${formatAddress(accountInfo.address)}`}
          >
            <TextStyled>UniqueScan</TextStyled>
            <IconWrapper>
              <Icon name={'arrow-up-right'} size={16} />
            </IconWrapper>
          </LinkStyled>
        </LinksWrapper>
      );
    }
  },
  {
    title: 'Actions',
    width: '25%',
    field: 'accountInfo',
    render(accountInfo: AccountInfo) {
      if (accountInfo.deposit) {
        return (
          <DepositActionsWrapper>
            <Button title={'Withdraw'} onClick={onShowWithdrawDepositModal(accountInfo.address)} role={'primary'} />
            <IconWithHint />
          </DepositActionsWrapper>
        );
      }
      return (
        <ActionsWrapper>
          <Button title={'Send'} onClick={onShowSendFundsModal(accountInfo.address)} />
          <Button title={'Get'} disabled={true} onClick={onShowSendFundsModal(accountInfo.address)} />
        </ActionsWrapper>
      );
    }
  }
];

const caretDown = { name: 'carret-down', size: 16, color: AdditionalLight };

enum AccountModal {
  create,
  importViaSeed,
  importViaJSON,
  importViaQRCode,
  sendFunds,
  withdrawDeposit
}

type AccountInfo = {
  address: string
  name: string
  balance?: {
    KSM?: BN
  }
  deposit?: BN
}

export const AccountsPage = () => {
  const { accounts, fetchAccounts, isLoading, isLoadingDeposits, fetchAccountsWithDeposits } = useAccounts();
  const [searchString, setSearchString] = useState<string>('');
  const [currentModal, setCurrentModal] = useState<AccountModal | undefined>();
  const [selectedAddress, setSelectedAddress] = useState<string>();
  const deviceSize = useDeviceSize();
  const { chainData } = useApi();

  useEffect(() => {
    if (isLoading) return;
    void fetchAccountsWithDeposits();
  }, [isLoading]);

  const formatAddress = useCallback((address: string) => {
    return toChainFormatAddress(address, chainData?.properties.ss58Format || 0);
  }, [chainData?.properties.ss58Format]);

  const onCreateAccountClick = useCallback(() => {
    setCurrentModal(AccountModal.create);
  }, []);

  const onImportViaSeedClick = useCallback(() => {
    setCurrentModal(AccountModal.importViaSeed);
  }, []);

  const onImportViaJSONClick = useCallback(() => {
    setCurrentModal(AccountModal.importViaJSON);
  }, []);

  const onImportViaQRClick = useCallback(() => {
    setCurrentModal(AccountModal.importViaQRCode);
  }, []);

  const onShowSendFundsModal = useCallback((address: string) => () => {
    setCurrentModal(AccountModal.sendFunds);
    setSelectedAddress(address);
  }, []);

  const onShowWithdrawDepositModal = useCallback((address: string) => () => {
    setCurrentModal(AccountModal.withdrawDeposit);
    setSelectedAddress(address);
  }, []);

  const onSearchStringChange = useCallback((value: string) => {
    setSearchString(value);
  }, []);

  const filteredAccounts = useMemo(() => {
    const reduceAccounts = (acc: (Account & { accountInfo: AccountInfo })[], account: Account) => {
      acc.push({
        ...account,
        accountInfo: { address: account.address, name: account.meta.name || '', balance: account.balance }
      });
      if (!account.deposits) return acc;

      const { sponsorshipFee, bids } = account.deposits;
      const { leader, withdraw } = bids || { leader: [], withdraw: [] };

      if ((!sponsorshipFee?.isZero() || leader.length !== 0 || withdraw.length !== 0)) {
        const getTotalAmount = (acc: BN, bid: TWithdrawBid) => acc.add(new BN(bid.amount));

        acc.push({
          ...account,
          accountInfo: {
            address: account.address,
            name: account.meta.name || '',
            deposit: (sponsorshipFee || new BN(0))
              .add(withdraw.reduce(getTotalAmount, new BN(0)))
              .add(leader.reduce(getTotalAmount, new BN(0)))
          }
        });
      }
      return acc;
    };

    if (!searchString) {
      return accounts.reduce(reduceAccounts, []);
    }
    return accounts
      .filter(
        (account) =>
          formatAddress(account.address).toLowerCase().includes(searchString.trim().toLowerCase()) ||
          account.meta.name?.toLowerCase().includes(searchString.trim().toLowerCase())
      )
      .reduce(reduceAccounts, []);
  }, [accounts, searchString, formatAddress]);

  const onChangeAccountsFinish = useCallback(async () => {
    setCurrentModal(undefined);
    await fetchAccounts();
    await fetchAccountsWithDeposits();
  }, []);

  const onModalClose = useCallback(() => {
    setCurrentModal(undefined);
  }, []);

  return (<PagePaper>
    <AccountPageWrapper>
      <Row>
        <CreateAccountButton title={'Create substrate account'} onClick={onCreateAccountClick} />
        <DropdownStyled
          dropdownRender={() => <DropdownMenu>
            <DropdownMenuItem onClick={onImportViaSeedClick}>Seed phrase</DropdownMenuItem>
            <DropdownMenuItem onClick={onImportViaJSONClick}>Backup JSON file</DropdownMenuItem>
            <DropdownMenuItem onClick={onImportViaQRClick}>QR-code</DropdownMenuItem>
          </DropdownMenu>}
        >
          <AddAccountButton title={'Add account via'} role={'primary'} iconRight={caretDown} />
        </DropdownStyled>
        <SearchInputWrapper>
          <SearchInputStyled
            placeholder={'Account'}
            iconLeft={{ name: 'magnify', size: 18 }}
            value={searchString}
            onChange={onSearchStringChange}
          />
        </SearchInputWrapper>
      </Row>
      <TableWrapper>
        <AccountTooltip/>
        <Table
          columns={getAccountsColumns({ isShortAddress: deviceSize === DeviceSize.sm, formatAddress, onShowSendFundsModal, onShowWithdrawDepositModal })}
          data={filteredAccounts}
          loading={isLoading || isLoadingDeposits}
        />
      </TableWrapper>
      <CreateAccountModal isVisible={currentModal === AccountModal.create} onFinish={onChangeAccountsFinish} onClose={onModalClose} />
      <ImportViaSeedAccountModal isVisible={currentModal === AccountModal.importViaSeed} onFinish={onChangeAccountsFinish} onClose={onModalClose} />
      <ImportViaJSONAccountModal isVisible={currentModal === AccountModal.importViaJSON} onFinish={onChangeAccountsFinish} onClose={onModalClose} />
      <ImportViaQRCodeAccountModal isVisible={currentModal === AccountModal.importViaQRCode} onFinish={onChangeAccountsFinish} onClose={onModalClose} />
      <TransferFundsModal isVisible={currentModal === AccountModal.sendFunds} onFinish={onModalClose} senderAddress={selectedAddress} />
      <WithdrawDepositModal
        isVisible={currentModal === AccountModal.withdrawDeposit}
        onFinish={onChangeAccountsFinish}
        onClose={onModalClose}
        address={selectedAddress}
      />
    </AccountPageWrapper>
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
  @media (max-width: 1024px) {
    width: 100%;
  }
`;

const AddAccountButton = styled(Button)`
  width: 196px;
  @media (max-width: 1024px) {
    width: 100%;
  }
`;

const AccountCellWrapper = styled.div`
  display: flex;
  padding: 20px 0 !important;
  column-gap: calc(var(--gap) / 2); 
  align-items: center;
`;

const BalancesWrapper = styled.div`
  && {
    display: flex;
    flex-direction: column;
    padding: 20px 0 !important;
  }
`;

const LinksWrapper = styled.div`
  padding: 0 !important;
`;

const LinkStyled = styled.a`
  display: flex;
  align-items: center;
  column-gap: calc(var(--gap) / 4);
`;

const ActionsWrapper = styled.div`
  && {
    display: flex;
    align-items: center;
    column-gap: var(--gap);
    padding: var(--gap) 0;
    @media (max-width: 768px) {
      flex-direction: column;
      row-gap: var(--gap);
      width: 100%;
      button {
        width: 100%;
      }
    }
  }
`;

const DepositActionsWrapper = styled(ActionsWrapper)`
  && {
    column-gap: calc(var(--gap) / 2);
    button {
      width: 148px;
    }
    @media (max-width: 768px) {
      flex-direction: row !important;
    }
  }
`;

const TextStyled = styled(Text)`
  && {
    color: var(--color-primary-500);
  }
`;

const IconWrapper = styled.div`
  && {
    width: 16px;
    height: 16px;
    color: var(--color-primary-500);
    padding: 0;

    path {
      stroke: currentColor;
    }
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
`;
