import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Button } from 'components/UI';
import { toChainFormatAddress } from 'api/chainApi/utils/addressUtils';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { Table } from 'components/Table';
import { PagePaper } from 'components/PagePaper/PagePaper';
import GetKSMModal from 'components/GetKSMModal/GetKSMModal';
import { WithdrawDepositModal } from './Modals/WithdrawDeposit';
import { TransferFundsModal } from './Modals/SendFunds';
import config from 'config';
import { AccountInfo } from './types';
import NoAccountsIcon from 'static/icons/no-accounts.svg';
import { getAccountsColumns } from './columns';
import { Account } from 'account/types';
import { useNavigate } from 'react-router-dom';
import { ConnectWalletModalContext } from 'account/ConnectWalletModalContext';

const testid = 'accounts-page';

enum AccountModal {
  sendFunds,
  withdrawDeposit,
  getKsmModal
}

export const AccountsPage = () => {
  const { setIsOpenConnectWalletModal } = useContext(
    ConnectWalletModalContext
  );
  const {
    accounts,
    isLoading
  } = useAccounts();
  const [currentModal, setCurrentModal] = useState<AccountModal | undefined>();
  const [selectedAddress, setSelectedAddress] = useState<string>();
  const navigate = useNavigate();
  const deviceSize = useDeviceSize();
  const { chainProperties, currentChainId } = useApi();

  useEffect(() => {
    if (!isLoading && !accounts.size) {
      navigate(`/${currentChainId}/market`);
    }
  }, [accounts, isLoading]);

  useEffect(() => {
    setCurrentModal(undefined);
  }, [currentChainId]);

  const formatAddress = useCallback((address: string) => {
    return toChainFormatAddress(address, chainProperties?.SS58Prefix || 0);
  }, [chainProperties?.SS58Prefix]);

  const onAccountActionClick = useCallback((modal: AccountModal) => (address: string) => () => {
    setCurrentModal(modal);
    setSelectedAddress(address);
  }, []);

  const onGetClick = useCallback((address: string) => () => {
    switch (chainProperties?.token) {
      case 'OPL':
        window.open('https://t.me/unique2faucet_opal_bot', '_blank', 'noopener');
        break;
      case 'QTZ':
        window.open('https://www.mexc.com/exchange/QTZ_USDT', '_blank', 'noopener');
        break;
      case 'UNQ':
        window.open('https://www.huobi.com/en-us/exchange/unq_usdt', '_blank', 'noopener');
        break;
      default:
        break;
    }
  }, [chainProperties]);

  const filteredAccounts: AccountInfo[] = useMemo(() => {
    const reduceAccounts = (acc: AccountInfo[], account: Account) => {
      acc.push({
        ...account
      });
      return acc;
    };

    return [...accounts.values()].reduce(reduceAccounts, []);
  }, [accounts, deviceSize]);

  const onChangeAccountsFinish = useCallback(() => {
    setCurrentModal(undefined);
  }, []);

  const onModalClose = useCallback(() => {
    setCurrentModal(undefined);
  }, []);

  return (<PagePaper>
    <AccountPageWrapper>
      <TableWrapper>
        <Table<AccountInfo>
          columns={getAccountsColumns({
            isSmallDevice: deviceSize === DeviceSize.sm,
            formatAddress,
            onShowSendFundsModal: onAccountActionClick(AccountModal.sendFunds),
            onShowWithdrawDepositModal: onAccountActionClick(AccountModal.withdrawDeposit),
            onGetClick,
            tokenSymbol: chainProperties?.token || '',
            scanUrl: currentChainId ? config.blockchains[currentChainId]?.scanUrl : ''
          })}
          data={filteredAccounts}
          loading={isLoading}
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
    </AccountPageWrapper>
    {config.rampApiKey && currentModal === AccountModal.getKsmModal && <GetKSMModal key={'modal-accounts-getKsm'} onClose={onModalClose}/>}
  </PagePaper>);
};

const AccountPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--prop-gap) * 2);
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
  column-gap: var(--prop-gap);
  width: 100%;

  @media (max-width: 1024px) {
    flex-direction: column;
    row-gap: var(--prop-gap);
    
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
