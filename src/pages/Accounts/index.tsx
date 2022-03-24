import React, { useCallback, useMemo, useState } from 'react';
import { Button, Text, InputText, Avatar } from '@unique-nft/ui-kit';
import { TableColumnProps } from '@unique-nft/ui-kit/dist/cjs/types';
import styled from 'styled-components/macro';

import { useAccounts } from '../../hooks/useAccounts';
import DefaultAvatar from '../../static/icons/default-avatar.svg';
import ArrowUpRight from '../../static/icons/arrow-up-right.svg';
import CopyIcon from '../../static/icons/copy.svg';
import config from '../../config';
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

const tokenSymbol = 'KSM';

type AccountsColumnsProps = {
  onShowSendFundsModal(address: string): () => void;
};

const copyAddress = (account: string) => () => {
  navigator.clipboard.writeText(account);
};

const getAccountsColumns = ({
  onShowSendFundsModal
}: AccountsColumnsProps): TableColumnProps[] => [
  {
    title: 'Account',
    width: '25%',
    field: 'accountInfo',
    render(accountInfo) {
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
    field: 'balance',
    render(balance) {
      const { KSM } = balance || {};
      return (
        <BalancesWrapper>
          <Text>{`${formatKusamaBalance(KSM || 0)} ${tokenSymbol}`}</Text>
        </BalancesWrapper>
      );
    }
  },
  {
    title: 'Block explorer',
    width: '25%',
    field: 'address',
    render(address) {
      return (
        <LinksWrapper>
          <LinkStyled
            target={'_blank'}
            rel={'noreferrer'}
            href={`${config.scanUrl}account/${address}`}
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
    field: 'address',
    render(address) {
      return (
        <ActionsWrapper>
          <Button title={'Send'} onClick={onShowSendFundsModal(address)} />
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
  sendFunds
}

export const AccountsPage = () => {
  const { accounts, fetchAccounts } = useAccounts();
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

  const onSendFundsClick = useCallback(
    (address: string) => () => {
      setCurrentModal(AccountModal.sendFunds);
      setSelectedAddress(address);
    },
    []
  );

  const onSearchStringChange = useCallback((value: string) => {
    setSearchString(value);
  }, []);

  const filteredAccounts = useMemo(() => {
    if (!searchString) {
      return accounts.map((item) => ({
        ...item,
        accountInfo: { address: item.address, name: item.meta.name }
      }));
    }
    return accounts
      .filter(
        (account) =>
          account.address.includes(searchString) ||
          account.meta.name?.includes(searchString)
      )
      .map((item) => ({
        ...item,
        accountInfo: { address: item.address, name: item.meta.name }
      }));
  }, [accounts, searchString]);

  const onChangeAccountsFinish = useCallback(() => {
    setCurrentModal(undefined);
    fetchAccounts();
  }, []);

  return (
    <PagePaper>
      <AccountPageWrapper>
        <Row>
          <Button
            title={'Create substrate account'}
            onClick={onCreateAccountClick}
          />
          <DropdownMenu title={'Add account via'} role={'primary'}>
            <DropdownMenuItem onClick={onImportViaSeedClick}>
              Seed phrase
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onImportViaJSONClick}>
              Backup JSON file
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onImportViaQRClick}>
              QR-code
            </DropdownMenuItem>
          </DropdownMenu>
          <SearchInputWrapper>
            <SearchInputStyled
              placeholder={'Account'}
              iconLeft={{ name: 'magnify', size: 18 }}
              onChange={onSearchStringChange}
            />
          </SearchInputWrapper>
        </Row>
        <Table
          columns={getAccountsColumns({
            onShowSendFundsModal: onSendFundsClick
          })}
          data={filteredAccounts}
        />
        <CreateAccountModal
          isVisible={currentModal === AccountModal.create}
          onFinish={onChangeAccountsFinish}
        />
        <ImportViaSeedAccountModal
          isVisible={currentModal === AccountModal.importViaSeed}
          onFinish={onChangeAccountsFinish}
        />
        <ImportViaJSONAccountModal
          isVisible={currentModal === AccountModal.importViaJSON}
          onFinish={onChangeAccountsFinish}
        />
        <ImportViaQRCodeAccountModal
          isVisible={currentModal === AccountModal.importViaQRCode}
          onFinish={onChangeAccountsFinish}
        />
        <TransferFundsModal
          isVisible={currentModal === AccountModal.sendFunds}
          onFinish={onChangeAccountsFinish}
          senderAddress={selectedAddress}
        />
      </AccountPageWrapper>
    </PagePaper>
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
  overflow: hidden;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const BalancesWrapper = styled.div`
  && {
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
    padding: 0;
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
