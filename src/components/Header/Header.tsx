import { FC, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Icon } from '../UI';

import { useScreenWidthFromThreshold } from 'hooks/useScreenWidthFromThreshold';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { useAccounts } from 'hooks/useAccounts';
import { useApi } from 'hooks/useApi';
import { TMenuItems } from '../PageLayout';
import { WalletManager } from './WalletManager/WalletManager';
import { DesktopMenuLink, MobileMenuLink } from './MenuLink';

interface HeaderProps {
  activeItem: TMenuItems;
}

export const Header: FC<HeaderProps> = ({ activeItem }) => {
  const { lessThanThreshold: showMobileMenu } =
    useScreenWidthFromThreshold(1279);
  const [mobileMenuIsOpen, toggleMobileMenu] = useState(false);
  const { selectedAccount, isLoading, accounts } = useAccounts();
  const { currentChainId } = useApi();

  const mobileMenuToggler = useCallback(() => {
    toggleMobileMenu((prevState) => !prevState);
  }, [selectedAccount]);

  const deviceSize = useDeviceSize();

  return (
    <HeaderStyled>
      <LeftSideColumn>
        {showMobileMenu && <MenuIcon
          onClick={mobileMenuToggler}
        >
          <Icon name={'menu'} size={32} />
          {/* <img src={menuIcon} alt='menu_icon' /> */}
        </MenuIcon>}
        <LogoLink to={'/'}>
          <LogoIcon src='/logos/logo.svg'/>
        </LogoLink>
        {!showMobileMenu && (
          <nav>
            <DesktopMenuLink to={`/${currentChainId || ''}/market`} active={activeItem === 'Market'}>
              Market
            </DesktopMenuLink>
            <DesktopMenuLink to={`/${currentChainId || ''}/myTokens`} active={activeItem === 'My tokens'} disabled={!selectedAccount || isLoading}>
              My tokens
            </DesktopMenuLink>
            <DesktopMenuLink to={`/${currentChainId || ''}/collections`} active={activeItem === 'My Collections'} disabled={!selectedAccount || isLoading}>
              My collections
            </DesktopMenuLink>
            <DesktopMenuLink to={`/${currentChainId || ''}/trades`} active={activeItem === 'Trades'}>
              Trades
            </DesktopMenuLink>
            <DesktopMenuLink to='/faq' active={activeItem === 'FAQ'}>
              FAQ
            </DesktopMenuLink>
          </nav>
        )}
      </LeftSideColumn>
      <RightSide>
        <WalletManager />
      </RightSide>
      {showMobileMenu && mobileMenuIsOpen && (
        <MobileMenu>
          <MobileMenuLink to={`/${currentChainId || ''}/market`} active={activeItem === 'Market'} onClick={mobileMenuToggler}>
            Market
          </MobileMenuLink>
          <MobileMenuLink
            to={`/${currentChainId || ''}/myTokens`}
            active={activeItem === 'My tokens'}
            onClick={mobileMenuToggler}
            disabled={!selectedAccount && !isLoading}
          >
            My tokens
          </MobileMenuLink>
          <MobileMenuLink to={`/${currentChainId || ''}/collections`}
            active={activeItem === 'My Collections'}
            onClick={mobileMenuToggler}
            disabled={!selectedAccount && !isLoading}
          >
            My collections
          </MobileMenuLink>
          <MobileMenuLink to={`/${currentChainId || ''}/trades`} active={activeItem === 'Trades'} onClick={mobileMenuToggler}>
            Trades
          </MobileMenuLink>
          <MobileMenuLink to='/faq' active={activeItem === 'FAQ'} onClick={mobileMenuToggler}>
            FAQ
          </MobileMenuLink>
          {deviceSize !== DeviceSize.lg && !!accounts.length &&
            <MobileMenuLink to={`/${currentChainId || ''}/accounts`} active={activeItem === 'Manage accounts'} onClick={mobileMenuToggler}>
              Manage accounts
            </MobileMenuLink>
          }
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
  @media (max-width: 567px) {
    .unique-modal-wrapper {
      padding: 0;
    }
  }
  @media (min-width: 1920px) {
    width: var(--prop-container-width);
  }
`;

const LeftSideColumn = styled.div`
  display: flex;
  align-items: center;
`;

const MenuIcon = styled.div`
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
  margin-right: 32px;
`;

const RightSide = styled.div`
  display: flex;
  align-items: center;
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
