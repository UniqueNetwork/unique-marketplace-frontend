import React from 'react';
import styled from 'styled-components';
import { TableColumnProps } from '@unique-nft/ui-kit';
import IconWithHint from 'components/IconWithHint/IconWithHint';
import AccountCard from 'components/Account/Account';
import { Button, Icon, Link, Text } from 'components/UI';
import { AdditionalLight, Grey500, Primary500 } from 'styles/colors';
import { formatBalance } from 'utils/textUtils';
import { AccountInfo } from './types';
import BalanceCell from './BalanceCell';
import { WithdrawButton } from './WithdrawButton';

const testid = 'accounts-page';

type AccountsColumnsProps = {
  isSmallDevice: boolean
  formatAddress(address: string): string
  onShowSendFundsModal(address: string): () => void
  onShowWithdrawDepositModal(address: string): () => void
  onGetClick: (address: string) => () => void
  tokenSymbol: string
  scanUrl: string
};

export const getAccountsColumns = ({
                              formatAddress,
                              onShowSendFundsModal,
                              onShowWithdrawDepositModal,
                              isSmallDevice,
                              onGetClick,
                              tokenSymbol,
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
    width: '35%',
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
    width: '20%',
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
    width: '17%',
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
    width: '28%',
    field: 'actions',
    render(_, { address, balances, isLocal }: AccountInfo) {
      const deposit = balances?.ethMirror.raw;
      const canSend = formatBalance(balances?.proper.parsed || '0') !== '0';
      return (
        <ActionsWrapper>
          <TransferActionsWrapper>
            <SendGetWrapper>
              <Button title={'Send'} onClick={onShowSendFundsModal(address)} disabled={!canSend} />
              <Button
                title={'Get'}
                onClick={onGetClick(address)}
                testid={`${testid}-${address}-get-button`}
              />
            </SendGetWrapper>
            {(!deposit?.isZero()) && <DepositActionsWrapper>
              <WithdrawButton
                amount={`${formatBalance(balances?.ethMirror.parsed || '0', 4)} ${tokenSymbol}`}
                onWithdraw={onShowWithdrawDepositModal(address)}
                testid={`${testid}-${address}-get-button`}
              />
              <IconWithHint align={{ appearance: 'vertical', vertical: 'bottom', horizontal: 'right' }}>
                <span>Learn more in <StyledLink href='/FAQ' target='_blank' rel='noreferrer'>FAQ</StyledLink></span>
              </IconWithHint>
            </DepositActionsWrapper>}
          </TransferActionsWrapper>
          <div>
          </div>
        </ActionsWrapper>
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

const TransferActionsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  grid-gap: var(--prop-gap);
  width: -webkit-fill-available;
`;

const DepositActionsWrapper = styled(TransferActionsWrapper)`
  && {
    display: flex;
    column-gap: calc(var(--gap) / 2);
    padding: 0;
    button {
      width: calc(100% - 32px);
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

const ActionsWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 8px 0;
  justify-content: flex-start;
  flex-wrap: nowrap;
  gap: var(--prop-gap);
  div:last-child {
    min-width: 28px;
  }
  button.unique-button.ghost {
    padding: 8px 0;
  }
`;

const SendGetWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: var(--prop-gap);
  flex-wrap: nowrap;
  button,
  a {
    flex: 1;
  }
`;
