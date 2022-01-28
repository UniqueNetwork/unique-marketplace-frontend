import { Button, Text } from '@unique-nft/ui-kit';
import { FC, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import cs from 'classnames';
import { useAccounts } from '../../hooks/useAccounts';
import { useScreenWidthFromThreshold } from '../../hooks/useScreenWidthFromThreshold';

import logo from '../../logos/logo-white-label-market.svg';
import menu from '../../static/icons/menu.svg';

import { TMenuItems } from '../PageLayout';

interface HeaderProps {
  activeItem: TMenuItems;
}

export const Header: FC<HeaderProps> = ({ activeItem }) => {
  const [allAccounts] = useAccounts();
  const { lessThanThreshold: showMobileMenu } =
    useScreenWidthFromThreshold(1279);
  const [mobileMenuIsOpen, toggleMobileMenu] = useState(false);

  const buttonClick = () => {
    console.log('button is clicked');
  };

  const account =
    allAccounts.length !== 0
      ? (
        allAccounts[0].address
      )
      : (
        <Button
          onClick={buttonClick}
          role='outlined'
          title='Create or connect account'
        />
      );

  const mobileMenuToggler = useCallback(() => {
    console.log('mobileMenuToggler');
    toggleMobileMenu((prevState) => !prevState);
  }, []);

  const balance = 0;

  return (
    <HeaderStyled>
      <div className='left-side'>
        {showMobileMenu && (
          <img
            className='menu'
            onClick={mobileMenuToggler}
            src={menu}
          />
        )}
        <img
          className='logo'
          src={logo}
        />
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
      </div>
      <div className='right-side'>
        <div className='balance'>Balance {balance}</div>
        {account}
      </div>
      {showMobileMenu && mobileMenuIsOpen && (
        <div className='mobileMenu'>
          <div onClick={mobileMenuToggler}>
            <Link to='/'>
              <Text
                className={cs('mobile-menu-item', { active: (activeItem === 'Market') })}
                color='additional-dark'
                size='m'
                weight='medium'
              >
                Market
              </Text>
            </Link>
          </div>
          <div onClick={mobileMenuToggler}>
            <Link to='myTokens'>
              <Text
                className={cs('mobile-menu-item', { active: (activeItem === 'My tokens') })}
                color='additional-dark'
                size='m'
                weight='medium'
              >
                My tokens
              </Text>
            </Link>
          </div>
          <div onClick={mobileMenuToggler}>
            <Link to='trades'>
              <Text
                className={cs('mobile-menu-item', { active: (activeItem === 'Trades') })}
                color='additional-dark'
                size='m'
                weight='medium'
              >
                Trades
              </Text>
            </Link>
          </div>
          <div onClick={mobileMenuToggler}>
            <Link to='faq'>
              <Text
                className={cs('mobile-menu-item', { active: (activeItem === 'FAQ') })}
                color='additional-dark'
                size='m'
                weight='medium'
              >
                FAQ
              </Text>
            </Link>
          </div>
        </div>
      )
      }
    </HeaderStyled>
  );
};

const HeaderStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  .left-side {
    display: flex;
    align-items: center;

    .menu {
      width: 32px;
      height: 32px;
      margin-right: 8px;
    }

    .logo {
      margin-right: 32px;
    }
  }

  .right-side {
    display: flex;
    align-items: center;
  }

  a {
    margin-right: 24px;
  }

  .balance {
    margin-left: 16px;
    margin-right: 16px;
  }

  .mobileMenu {
    position: absolute;
    top: 80px;
    left: 0;
    right: 0;
    height: 100vh;
    background-color: var(--white-color);
    box-shadow: inset 0 2px 8px rgb(0 0 0 / 6%);
    display: flex;
    flex-direction: column;
    padding: 16px;

    a {
      margin-right: 0;
    }

    .mobile-menu-item {
      display: flex;
      min-width: 100%;
      border-radius: 4px;
      
      padding: 8px 16px;

      &:hover{
        color: var(--primary-color);
      }

      &.active{
        background-color: var(--primary-color);
        color: var(--white-color);
      }
    }
  }
`;
