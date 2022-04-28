import { Text } from '@unique-nft/ui-kit';
import { FC, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro'; // Todo: https://cryptousetech.atlassian.net/browse/NFTPAR-1201

import { useScreenWidthFromThreshold } from '../../hooks/useScreenWidthFromThreshold';
import menu from '../../static/icons/menu.svg';
import { TMenuItems } from '../PageLayout';
import { WalletManager } from './WalletManager/WalletManager';
import useDeviceSize, { DeviceSize } from '../../hooks/useDeviceSize';

interface HeaderProps {
  activeItem: TMenuItems;
}

export const Header: FC<HeaderProps> = ({ activeItem }) => {
  const { lessThanThreshold: showMobileMenu } =
    useScreenWidthFromThreshold(1279);
  const [mobileMenuIsOpen, toggleMobileMenu] = useState(false);
  const mobileMenuToggler = useCallback(() => {
    toggleMobileMenu((prevState) => !prevState);
  }, []);

  const deviceSize = useDeviceSize();

  return (
    <HeaderStyled>
      <LeftSideColumn>
        {showMobileMenu && <MenuIcon
          onClick={mobileMenuToggler}
          src={menu}
        />}
        <LogoLink to={'/'}>
          <LogoIcon src={'/logos/sadu-logo.svg'} />
        </LogoLink>
        {!showMobileMenu && (
          <nav>
            <Link to='/'>
              <DesktopMenuItem
                $active={activeItem === 'Exhibition'}
                color='additional-dark'
                size='m'
                weight='medium'
              >
                Exhibition
              </DesktopMenuItem>
            </Link>
            <Link to='myGallery'>
              <DesktopMenuItem
                $active={activeItem === 'My Gallery'}
                color='additional-dark'
                size='m'
                weight='medium'
              >
                My Gallery
              </DesktopMenuItem>
            </Link>
            <Link to='trades'>
              <DesktopMenuItem
                $active={activeItem === 'Trades'}
                color='additional-dark'
                size='m'
                weight='medium'
              >
                Trades
              </DesktopMenuItem>
            </Link>
            <Link to='aboutSadu'>
              <DesktopMenuItem
                $active={activeItem === 'About Sādu'}
                color='additional-dark'
                size='m'
                weight='medium'
              >
                About Sādu
              </DesktopMenuItem>
            </Link>
          </nav>
        )}
      </LeftSideColumn>
      <RightSide>
        <WalletManager />
      </RightSide>
      {showMobileMenu && mobileMenuIsOpen && (
        <MobileMenu>
          <LinkWrapper onClick={mobileMenuToggler}>
            <Link to='/'>
              <TextStyled
                $active={activeItem === 'Exhibition'}
                color='additional-dark'
                size='m'
                weight='medium'
              >
                Exhibition
              </TextStyled>
            </Link>
          </LinkWrapper>
          <LinkWrapper onClick={mobileMenuToggler}>
            <Link to='myGallery'>
              <TextStyled
                $active={activeItem === 'My Gallery'}
                color='additional-dark'
                size='m'
                weight='medium'
              >
                My Gallery
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
            <Link to='aboutSadu'>
              <TextStyled
                $active={activeItem === 'About Sādu'}
                color='additional-dark'
                size='m'
                weight='medium'
              >
                About Sādu
              </TextStyled>
            </Link>
          </LinkWrapper>
          {deviceSize !== DeviceSize.lg && <LinkWrapper onClick={mobileMenuToggler}>
            <Link to='accounts'>
              <TextStyled
                $active={activeItem === 'Manage accounts'}
                color='additional-dark'
                size='m'
                weight='medium'
              >
                Manage accounts
              </TextStyled>
            </Link>
          </LinkWrapper>}
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

const LogoLink = styled(Link)`
  @media (max-width: 567px) {
    display: none;
  }
`;

const LogoIcon = styled.img`
  padding-top: 24px;
  padding-bottom: 24px;
  margin-right: 32px;
  width: auto;
  max-width: 130px;
  height: 90px;
`;

const RightSide = styled.div`
  display: flex;
  align-items: center;
`;

const LinkWrapper = styled.div`
  display: contents;
  a {
    margin-right: 0;
  }
`;

const MobileMenu = styled.div`
  position: absolute;
  top: 81px;
  left: 0;
  right: 0;
  height: 100vh;
  background-color: var(--color-additional-light);
  box-shadow: inset 0 2px 8px rgb(0 0 0 / 6%);
  display: flex;
  flex-direction: column;
  padding: 16px;
  z-index: 9;
`;

const TextStyled = styled(Text) <{ $active?: boolean }>`
  && {
    display: flex;
    border-radius: 4px;
    padding: 8px 16px;
    background-color: ${(props) => props.$active ? 'var(--color-primary-500)' : 'transparent'};
    color: ${(props) => props.$active ? 'var(--color-additional-light)' : 'var(--color-additional-dark)'};
    &:hover {
      color: ${(props) => (props.$active ? 'var(--color-additional-light)' : 'var(--color-primary-500)')};
    }
  }
`;

const DesktopMenuItem = styled(Text) <{ $active?: boolean }>`
  && {
    font-size: 18px;
    padding: 12px;
    font-weight: 200;
    margin-right: 24px;
    letter-spacing: 1px;
    margin: 0 12px;
    border-radius: 8px !important;
    text-transform: capitalize;
    transition: .4s;
    background-color: ${(props) => props.$active ? 'var(--color-primary-900)' : 'none'};
    color: ${(props) => props.$active ? 'var(--color-additional-dark)' : 'var(--color-primary-500)'};
    border-bottom: ${(props) => props.$active ? '1px solid var(--color-additional-dark)' : 'none'};
    &:hover {
      background-color: rgba(255,255,255,.2);
      color: ${(props) => (props.$active ? 'var(--color-additional-dark)' : 'var(--color-primary-400)')};
    }
  }
`;
