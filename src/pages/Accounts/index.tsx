import React, { useCallback, useMemo, useState } from 'react';
import { Button, Text, InputText, Table, Avatar } from '@unique-nft/ui-kit';
import { TableColumnProps } from '@unique-nft/ui-kit/dist/cjs/types';
import styled from 'styled-components/macro';

import { useAccounts } from '../../hooks/useAccounts';
import DefaultAvatar from '../../static/icons/default-avatar.svg';
import ArrowUpRight from '../../static/icons/arrow-up-right.svg';
import config from '../../config';
import { Icon } from '../../components/Icon/Icon';
import { CreateAccountModal } from './Modals/CreateAccount';

const tokenSymbol = 'KSM';

const AccountsColumns: TableColumnProps[] = [
  {
    title: 'Account',
    width: '33%',
    field: 'accountInfo',
    render(accountInfo) {
      return <AccountCellWrapper>
        <Avatar size={24} src={DefaultAvatar} />
        <AccountInfoWrapper>
          <Text>{accountInfo.name}</Text>
          <Text size={'s'} color={'grey-500'}>{accountInfo.address}</Text>
        </AccountInfoWrapper>
      </AccountCellWrapper>;
    }
  },
  {
    title: 'Balance',
    width: '33%',
    field: 'balance',
    render(balance) {
      const { KSM } = balance || {};
      return <BalancesWrapper>
        <Text>{`${KSM?.toString() || 0} ${tokenSymbol}`}</Text>
      </BalancesWrapper>;
    }
  },
  {
    title: 'Block explorer',
    width: '33%',
    field: 'address',
    render(address) {
      return <LinksWrapper>
        <LinkStyled target={'_blank'} rel={'noreferrer'} href={`${config.scanUrl}${address}`}>
          <Text color={'primary-500'}>UniqueScan</Text>
          <Icon size={16} path={ArrowUpRight} color={'none'} />
        </LinkStyled>
      </LinksWrapper>;
    }
  }
];

export const AccountsPage = () => {
  const { accounts } = useAccounts();
  const [searchString, setSearchString] = useState<string>('');
  const [isCreateAccountVisible, setIsCreateAccountVisible] = useState<boolean>(false);
  const [isImportAccountVisible, setIsImportAccountVisible] = useState<boolean>(false);

  const onCreateAccountClick = useCallback(() => {
    setIsCreateAccountVisible(true);
  }, []);

  const onImportViaSeedClick = useCallback(() => {
    setIsImportAccountVisible(true);
  }, []);

  const onSearchStringChange = useCallback(
    (value: string) => {
      setSearchString(value);
    },
    []
  );

  const filteredAccounts = useMemo(() => {
    if (!searchString) {
      return accounts.map((item) => ({ ...item, accountInfo: { address: item.address, name: item.meta.name } }));
    }
    return accounts.filter((account) => account.address.includes(searchString) || account.meta.name?.includes(searchString))
      .map((item) => ({ ...item, accountInfo: { address: item.address, name: item.meta.name } }));
  }, [accounts, searchString]);

  const onChangeAccountsFinish = useCallback(() => {
    setIsCreateAccountVisible(false);
  }, []);

  return (
    <AccountPageWrapper>
      <Row>
        <Button title={'Create substrate account'} onClick={onCreateAccountClick} />
        <Button title={'Import via seed phrase'} onClick={onImportViaSeedClick} role={'primary'} />
        <SearchInputWrapper>
          <SearchInputStyled placeholder={'Account'} iconLeft={{ name: 'magnify', size: 18 }} onChange={onSearchStringChange}/>
        </SearchInputWrapper>
      </Row>
      <Table
        columns={AccountsColumns}
        data={filteredAccounts}
      />
      <CreateAccountModal isVisible={isCreateAccountVisible} onFinish={onChangeAccountsFinish} />
    </AccountPageWrapper>
  );
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
`;

const BalancesWrapper = styled.div`
  padding: 0;
`;

const LinksWrapper = styled.div`
  padding: 0 !important;
`;

const LinkStyled = styled.a`
  display: flex;
  align-items: center;
  column-gap: calc(var(--gap) / 2);
`;
