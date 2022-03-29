import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Text, InputText, Avatar } from '@unique-nft/ui-kit';
import { TableColumnProps } from '@unique-nft/ui-kit/dist/cjs/types';
import styled from 'styled-components/macro';
import { BN } from '@polkadot/util';

import { useAccounts } from '../../hooks/useAccounts';
import { CreateAccountModal } from './Modals/CreateAccount';
import { ImportViaSeedAccountModal } from './Modals/ImportViaSeed';
import { DropdownMenu, DropdownMenuItem } from '../../components/DropdownMenu/DropdownMenu';
import { ImportViaJSONAccountModal } from './Modals/ImportViaJson';
import { ImportViaQRCodeAccountModal } from './Modals/ImportViaQRCode';
import { TransferFundsModal } from './Modals/SendFunds';
import { Table } from '../../components/Table';
import { formatKusamaBalance } from '../../utils/textUtils';
import { PagePaper } from '../../components/PagePaper/PagePaper';
import { Icon } from '../../components/Icon/Icon';
import { WithdrawDepositStagesModal } from './Modals/WithdrawDeposit';
import { Account } from '../../account/AccountContext';
import DefaultAvatar from '../../static/icons/default-avatar.svg';
import ArrowUpRight from '../../static/icons/arrow-up-right.svg';
import CopyIcon from '../../static/icons/copy.svg';
import config from '../../config';

const tokenSymbol = 'KSM';

type AccountsColumnsProps = {
  onShowSendFundsModal(address: string): () => void;
  onShowWithdrawDepositModal(address: string): () => void;
};

const copyAddress = (account: string) => () => {
  navigator.clipboard.writeText(account);
};

const getAccountsColumns = ({ onShowSendFundsModal, onShowWithdrawDepositModal }: AccountsColumnsProps): TableColumnProps[] => [
  {
    title: 'Account',
    width: '25%',
    field: 'accountInfo',
    render(accountInfo) {
      if (accountInfo.deposit) return null;
      return (
        <AccountCellWrapper>
          <Avatar size={24} src={DefaultAvatar} />
          <AccountInfoWrapper>
            <Text>{accountInfo.name}</Text>
            <AddressRow>
              <Text size={'s'} color={'grey-500'}>
                {accountInfo.address}
              </Text>
              <a onClick={copyAddress(accountInfo.address)}>
                <CopyIconWrapper>
                  <Icon path={CopyIcon} />
                </CopyIconWrapper>
              </a>
            </AddressRow>
          </AccountInfoWrapper>
        </AccountCellWrapper>
      );
    }
  },
  {
    title: 'Balance',
    width: '25%',
    field: 'accountInfo',
    render(accountInfo) {
      const { KSM } = accountInfo.balance || { KSM: accountInfo.deposit || 0 };
      const isDeposit = !!accountInfo.deposit;
      return (
        <BalancesWrapper>
          {!isDeposit && <Text>{`${formatKusamaBalance(KSM || 0)} ${tokenSymbol}`}</Text>}
          {isDeposit && (<>
            <Text color={'grey-500'} size={'s'}>{`${formatKusamaBalance(KSM || 0)} ${tokenSymbol}`}</Text>
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
    render(accountInfo) {
      if (accountInfo.deposit) return null;
      return (
        <LinksWrapper>
          <LinkStyled
            target={'_blank'}
            rel={'noreferrer'}
            href={`${config.scanUrl}account/${accountInfo.address}`}
          >
            <TextStyled>UniqueScan</TextStyled>
            <IconWrapper>
              <Icon path={ArrowUpRight} />
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
    render(accountInfo) {
      if (accountInfo.deposit) {
        return (
          <ActionsWrapper>
            <Button title={'Withdraw'} onClick={onShowWithdrawDepositModal(accountInfo.address)} role={'primary'} />
          </ActionsWrapper>
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
  const { accounts, fetchAccounts, isLoading, isLoadingBalances } = useAccounts();
  const [searchString, setSearchString] = useState<string>('');
  const [currentModal, setCurrentModal] = useState<AccountModal | undefined>();
  const [selectedAddress, setSelectedAddress] = useState<string>();

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
    const reduceAccounts = (acc: (Account & { accountInfo: AccountInfo })[], account: Account, index: number) => {
      acc.push({
        ...account,
        accountInfo: { address: account.address, name: account.meta.name || '', balance: account.balance }
      });
      if (account.deposit && !account.deposit.isZero()) {
        acc.push({
          ...account,
          accountInfo: { address: account.address, name: account.meta.name || '', deposit: account.deposit }
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
          account.address.toLowerCase().includes(searchString.trim().toLowerCase()) ||
          account.meta.name?.toLowerCase().includes(searchString.trim().toLowerCase())
      )
      .reduce(reduceAccounts, []);
  }, [accounts, searchString]);

  const onChangeAccountsFinish = useCallback(async () => {
    setCurrentModal(undefined);
    await fetchAccounts();
  }, []);

  return (<PagePaper>
    <AccountPageWrapper>
      <Row>
        <Button title={'Create substrate account'} onClick={onCreateAccountClick} />
        <DropdownMenu title={'Add account via'} role={'primary'}>
          <DropdownMenuItem onClick={onImportViaSeedClick}>Seed phrase</DropdownMenuItem>
          <DropdownMenuItem onClick={onImportViaJSONClick}>Backup JSON file</DropdownMenuItem>
          <DropdownMenuItem onClick={onImportViaQRClick}>QR-code</DropdownMenuItem>
        </DropdownMenu>
        <SearchInputWrapper>
          <SearchInputStyled
            placeholder={'Account'}
            iconLeft={{ name: 'magnify', size: 18 }}
            value={searchString}
            onChange={onSearchStringChange}
          />
        </SearchInputWrapper>
      </Row>
      <Table
        columns={getAccountsColumns({ onShowSendFundsModal, onShowWithdrawDepositModal })}
        data={filteredAccounts}
        loading={isLoading || isLoadingBalances}
      />
      <CreateAccountModal isVisible={currentModal === AccountModal.create} onFinish={onChangeAccountsFinish} />
      <ImportViaSeedAccountModal isVisible={currentModal === AccountModal.importViaSeed} onFinish={onChangeAccountsFinish} />
      <ImportViaJSONAccountModal isVisible={currentModal === AccountModal.importViaJSON} onFinish={onChangeAccountsFinish} />
      <ImportViaQRCodeAccountModal isVisible={currentModal === AccountModal.importViaQRCode} onFinish={onChangeAccountsFinish} />
      <TransferFundsModal isVisible={currentModal === AccountModal.sendFunds} onFinish={onChangeAccountsFinish} senderAddress={selectedAddress} />
      <WithdrawDepositStagesModal isVisible={currentModal === AccountModal.withdrawDeposit} onFinish={onChangeAccountsFinish} address={selectedAddress} />
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
`;

const SearchInputWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: flex-end;
`;

const SearchInputStyled = styled(InputText)`
  flex-basis: 720px;
`;

const AccountCellWrapper = styled.div`
  display: flex;
  padding: 20px 0 !important;
`;

const AccountInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const BalancesWrapper = styled.div`
  && {
    display: flex;
    flex-direction: column;
    padding: 0;
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

const CopyIconWrapper = styled.div`
  && {
    width: 24px;
    height: 24px;
    color: var(--color-grey-400);
    padding: 0;
    cursor: copy;
    svg {
      transform: translateY(-2px);
    }
  }
`;

const AddressRow = styled.div`
  && {
    display: flex;
    padding: 0;
  }
`;
