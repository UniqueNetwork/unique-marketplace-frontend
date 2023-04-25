import React from 'react';
import { TableColumnProps } from '@unique-nft/ui-kit';
import IconWithHint from 'components/IconWithHint/IconWithHint';
import { AccountInfo } from './types';
import AccountCard from 'components/Account/Account';
import BalanceCell from './BalanceCell';
import { Button, Icon, Link, Text } from 'components/UI';
import { AdditionalLight, Grey500, Primary500 } from 'styles/colors';
import { formatKusamaBalance } from 'utils/textUtils';
import config from 'config';
import styled from 'styled-components';

const tokenSymbol = 'KSM';

const testid = 'accounts-page';

type AccountsColumnsProps = {
  isSmallDevice: boolean
  formatAddress(address: string): string
  onShowSendFundsModal(address: string): () => void
  onShowWithdrawDepositModal(address: string): () => void
  onShowDeleteLocalAccountModal(address: string): () => void
  onShowGetKsmModal: () => void
  scanUrl: string
};

export const getAccountsColumns = ({
                              formatAddress,
                              onShowSendFundsModal,
                              onShowWithdrawDepositModal,
                              isSmallDevice,
                              onShowDeleteLocalAccountModal,
                              onShowGetKsmModal,
                              scanUrl
                            }: AccountsColumnsProps): TableColumnProps[] => [
  {
    title: (
      <>
        <Title data-testid={`${testid}-account-column`}>Account</Title>
        {!isSmallDevice &&
        <IconWithHint align={{ appearance: 'horizontal', vertical: 'top', horizontal: 'right' }}>
          <span>Substrate account addresses (Kusama, Quartz, Polkadot, Unique, etc.) may be represented by a different address
            character sequence, but they can be converted between each other because they share the same public key. You
            can see all transformations for any given address on <StyledLink href='https://polkadot.subscan.io/tools/ss58_transform' target='_blank' rel='noreferrer'>Subscan</StyledLink>.</span>
        </IconWithHint>
        }
      </>
    ),
    width: '25%',
    field: 'accountInfo',
    render(_, row: AccountInfo) {
      if (row.deposit && !isSmallDevice) return <></>;
      return (
        <AccountCellWrapper>
          <AccountCard accountName={row.name}
            accountAddress={row.address}
            canCopy
            isShort={isSmallDevice}
            testid={`${testid}-${row.address}`}
          />
        </AccountCellWrapper>
      );
    }
  },
  {
    title: (<Title data-testid={`${testid}-balance-column`}>Balance</Title>),
    width: '25%',
    field: 'balance',
    render(_, row: AccountInfo) {
      return (<BalanceCell accountInfo={row}
        isSmallDevice={isSmallDevice}
        tokenSymbol={tokenSymbol}
        data-testid={`${testid}-${row.address}`}
      />);
    }
  },
  {
    title: (<Title data-testid={`${testid}-blockexpolorer-column`}>Block explorer</Title>),
    width: '25%',
    field: 'blockExplorer',
    render(_, { address, deposit }: AccountInfo) {
      if (deposit && !isSmallDevice) return <></>;
      return (
        <LinksWrapper>
          <LinkStyled
            target={'_blank'}
            rel={'noreferrer'}
            href={`${scanUrl}account/${formatAddress(address)}`}
            data-testid={`${testid}-${address}-blockexpolorer-link`}
          >
            <TextStyled>UniqueScan</TextStyled>
            <IconWrapper>
              <Icon name={'arrow-up-right'} size={16} color={Primary500} />
            </IconWrapper>
          </LinkStyled>
        </LinksWrapper>
      );
    }
  },
  {
    title: isSmallDevice ? '' : (<Title data-testid={`${testid}-actions-column`}>Actions</Title>),
    width: '25%',
    field: 'actions',
    render(_, { address, deposit, balance, isLocal }: AccountInfo) {
      if (deposit && !isSmallDevice) {
        return (
          <DepositActionsWrapper>
            <Button title={'Withdraw'}
              onClick={onShowWithdrawDepositModal(address)}
              role={'primary'}
              testid={`${testid}-${address}-withdraw-button`}
            />
            <IconWithHint align={{ appearance: 'vertical', vertical: 'bottom', horizontal: 'right' }}>
              <span>Learn more in <StyledLink href='/FAQ' target='_blank' rel='noreferrer'>FAQ</StyledLink></span>
            </IconWithHint>
          </DepositActionsWrapper>
        );
      }
      return (
        <>
          <ActionsWrapper>
            <Button title={'Send'} onClick={onShowSendFundsModal(address)} disabled={!balance?.parsed} />
            <Button
              title={'Get'}
              onClick={onShowGetKsmModal}
              disabled={!config.rampApiKey}
              testid={`${testid}-${address}-get-button`}
            />
            {isLocal && <Button title={'Delete'} onClick={onShowDeleteLocalAccountModal(address)} testid={`${testid}-${address}-delete-button`} />}
          </ActionsWrapper>
          {(deposit && isSmallDevice) && <DepositActionsWrapper>
            <Button title={'Withdraw'}
              onClick={onShowWithdrawDepositModal(address)}
              role={'primary'}
              testid={`${testid}-${address}-get-button`}
            />
            <IconWithHint align={{ appearance: 'vertical', vertical: 'bottom', horizontal: 'right' }}>
              <span>Learn more in <StyledLink href='/FAQ' target='_blank' rel='noreferrer'>FAQ</StyledLink></span>
            </IconWithHint>
          </DepositActionsWrapper>}
        </>
      );
    }
  }
];

const Title = styled.p`
  color: ${Grey500};
  font-size: 16px;
  line-height: 24px;
  @media (max-width: 768px) {
    margin-bottom: 4px;
  }
`;

const AccountCellWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
  align-items: center;
`;

const LinksWrapper = styled.div`
  padding: 0 !important;
`;

const LinkStyled = styled(Link)`
  display: flex;
  align-items: center;
  column-gap: calc(var(--gap) / 4);
  width: fit-content;
`;

const ActionsWrapper = styled.div`
  && {
    display: flex;
    align-items: center;
    column-gap: var(--gap);
    padding: var(--gap) 0;
    flex-wrap: wrap;
    gap: 16px;
    margin: var(--gap) 0;
    @media (max-width: 768px) {
      flex-direction: row;
      row-gap: var(--gap);
      width: 100%;
      margin: 0;
      button {
        width: calc((100% - var(--gap)) / 2);
      }
    }
  }
`;

const DepositActionsWrapper = styled(ActionsWrapper)`
  && {
    column-gap: calc(var(--gap) / 2);
    padding: 0;
    button {
      width: calc(100% - 32px);
      max-width: 148px;
    }
    @media (max-width: 768px) {
      button {
        max-width: 100%;
      }
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

const StyledLink = styled.a`
  color: ${AdditionalLight};
  text-decoration: underline;
  
  &&:hover {
    text-decoration: none;
  }
`;
