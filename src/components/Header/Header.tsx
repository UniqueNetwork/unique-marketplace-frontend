import { Button, Select, Text } from '@unique-nft/ui-kit';
import { FC, useCallback, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro'; // Todo: https://cryptousetech.atlassian.net/browse/NFTPAR-1201

import { useScreenWidthFromThreshold } from '../../hooks/useScreenWidthFromThreshold';
import logo from '../../logos/logo-white-label-market.svg';
import menu from '../../static/icons/menu.svg';
import { TMenuItems } from '../PageLayout';
import { AdditionalColorDark, AdditionalColorLight, Primary500 } from '../../styles/colors';
import accountContext from '../../account/AccountContext';

interface HeaderProps {
  activeItem: TMenuItems;
}

export const Header: FC<HeaderProps> = ({ activeItem }) => {
  const { selectedAccount, changeAccount, accounts } = useContext(accountContext);
  const { lessThanThreshold: showMobileMenu } =
    useScreenWidthFromThreshold(1279);
  const [mobileMenuIsOpen, toggleMobileMenu] = useState(false);

  const buttonClick = () => {
    console.log('button is clicked');
  };

  const onAccountChange = useCallback((address: string) => {
    const newAccount = accounts.find((item) => item.address === address);
    console.log(address, newAccount);
    if (newAccount) changeAccount(newAccount);
  }, [accounts]);

  const account = selectedAccount
      ? (
        <SelectStyled
          options={accounts.map((account) => ({ id: account.address, title: account.address }))}
          value={selectedAccount.address}
          onChange={onAccountChange}
        />
        )
      : (
        <Button
          onClick={buttonClick}
          role='outlined'
          title='Create or connect account'
        />
      );

  const mobileMenuToggler = useCallback(() => {
    toggleMobileMenu((prevState) => !prevState);
  }, []);

  const balance = selectedAccount?.balance?.KSM?.toNumber() || 0;

  return (
    <HeaderStyled>
      <LeftSideColumn>
        {showMobileMenu && <MenuIcon
          onClick={mobileMenuToggler}
          src={menu}
        />}
        <LogoIcon src={logo} />
        {!showMobileMenu && (
          <nav>
            <Link to='/'>
              <Text
                color={
                  activeItem === 'Market' ? 'additional-dark' : 'primary-500'
                }
                size='m'
                weight='medium'
              >
                Market
              </Text>
            </Link>
            <Link to='myTokens'>
              <Text
                color={
                  activeItem === 'My tokens' ? 'additional-dark' : 'primary-500'
                }
                size='m'
                weight='medium'
              >
                My tokens
              </Text>
            </Link>
            <Link to='trades'>
              <Text
                color={
                  activeItem === 'Trades' ? 'additional-dark' : 'primary-500'
                }
                size='m'
                weight='medium'
              >
                Trades
              </Text>
            </Link>
            <Link to='faq'>
              <Text
                color={activeItem === 'FAQ' ? 'additional-dark' : 'primary-500'}
                size='m'
                weight='medium'
              >
                FAQ
              </Text>
            </Link>
          </nav>
        )}
      </LeftSideColumn>
      <RightSide>
        <Balance>Balance {balance}</Balance>

        {account}
      </RightSide>
      {showMobileMenu && mobileMenuIsOpen && (
        <MobileMenu>
          <LinkWrapper onClick={mobileMenuToggler}>
            <Link to='/'>
              <TextStyled
                $active={activeItem === 'Market'}
                color='additional-dark'
                size='m'
                weight='medium'
              >
                Market
              </TextStyled>
            </Link>
          </LinkWrapper>
          <LinkWrapper onClick={mobileMenuToggler}>
            <Link to='myTokens'>
              <TextStyled
                $active={activeItem === 'My tokens'}
                color='additional-dark'
                size='m'
                weight='medium'
              >
                My tokens
              </TextStyled>
            </Link>
          </LinkWrapper>
          <LinkWrapper onClick={mobileMenuToggler}>
            <Link to='trades'>
              <TextStyled
                $active={activeItem === 'Trades'}
                color='additional-dark'
                size='m'
                weight='medium'
              >
                Trades
              </TextStyled>
            </Link>
          </LinkWrapper>
          <LinkWrapper onClick={mobileMenuToggler}>
            <Link to='faq'>
              <TextStyled
                $active={activeItem === 'FAQ'}
                color='additional-dark'
                size='m'
                weight='medium'
              >
                FAQ
              </TextStyled>
            </Link>
          </LinkWrapper>
        </MobileMenu>
      )}
    </HeaderStyled>
  );
};

const HeaderStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  a {
    margin-right: 24px;
  }
`;

const LeftSideColumn = styled.div`
  display: flex;
  align-items: center;
`;

const MenuIcon = styled.img`
  width: 32px;
  height: 32px;
  margin-right: 8px;
`;

const LogoIcon = styled.img`
  margin-right: 32px;
`;

const RightSide = styled.div`
  display: flex;
  align-items: center;
`;

const Balance = styled.div`
  margin-left: 16px;
  margin-right: 16px;
`;

const LinkWrapper = styled.div`
  display: contents;

  a {
    margin-right: 0;
  }
`;

const MobileMenu = styled.div`
  position: absolute;
  top: 80px;
  left: 0;
  right: 0;
  height: 100vh;
  background-color: ${AdditionalColorLight};
  box-shadow: inset 0 2px 8px rgb(0 0 0 / 6%);
  display: flex;
  flex-direction: column;
  padding: 16px;
  z-index: 9;
`;

const TextStyled = styled(Text) <{ $active?: boolean }>`
  && {
    display: flex;
    min-width: 100%;
    border-radius: 4px;
    padding: 8px 16px;
    background-color: ${(props) => props.$active ? Primary500 : 'transparent'};
    color: ${(props) => props.$active ? AdditionalColorLight : AdditionalColorDark};

    &:hover {
      color: ${(props) => (props.$active ? AdditionalColorLight : Primary500)};
    }
  }
`;

const SelectStyled = styled(Select)`
  width: 430px;
`;
