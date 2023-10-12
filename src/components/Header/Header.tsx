import { FC, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Dropdown, Icon, Text } from '../UI';

import { useScreenWidthFromThreshold } from 'hooks/useScreenWidthFromThreshold';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { useAccounts } from 'hooks/useAccounts';
import { useApi } from 'hooks/useApi';
import { TMenuItems } from '../PageLayout';
import { WalletManager } from './WalletManager/WalletManager';
import { DesktopMenuItem, DesktopMenuLink, MobileMenuItem, MobileMenuLink } from './MenuLink';
import config from 'config';
import { GetButton } from './GetButton';

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
            <MenuDropdown
              options={[
                {
                  title: 'NFT',
                  url: `${config.blockchains[currentChainId || ''].walletUrl}create-nft`
                },
                {
                  title: 'Collection',
                  url: `${config.blockchains[currentChainId || ''].walletUrl}create-collection/main-information`
                }
              ]}
              optionKey='title'
              optionValue='title'
              onChange={({ url }) => {
                window.open(url as string, '_blank', 'noopener');
              }}
              optionRender={(option) => {
                return <DesktopMenuItem>{option.title as string}</DesktopMenuItem>;
              }}
            >
              <DesktopMenuItem>Create</DesktopMenuItem>
            </MenuDropdown>
            <DesktopMenuLink to={`/${currentChainId || ''}/sellTokens`} active={activeItem === 'Sell tokens'} disabled={!selectedAccount || isLoading}>
              Sell tokens
            </DesktopMenuLink>
            <DesktopMenuLink to={`/${currentChainId || ''}/collections`} active={activeItem === 'My collections'} disabled={!selectedAccount || isLoading}>
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
        <GetButton />
        <WalletManager />
      </RightSide>
      {showMobileMenu && mobileMenuIsOpen && (
        <MobileMenu>
          <MobileMenuLink to={`/${currentChainId || ''}/market`} active={activeItem === 'Market'} onClick={mobileMenuToggler}>
            Market
          </MobileMenuLink>
          <MobileMenuDropdown
            options={[
                {
                  title: 'NFT',
                  url: `${config.blockchains[currentChainId || ''].walletUrl}create-nft`
                },
                {
                  title: 'Collection',
                  url: `${config.blockchains[currentChainId || ''].walletUrl}create-collection/main-information`
                }
              ]}
            optionValue='title'
            optionKey='title'
            onChange={({ url }) => {
              window.open(url as string, '_blank', 'noopener');
            }}
          >
            <Text color = 'additional-dark'>Create</Text>
          </MobileMenuDropdown>
          <MobileMenuLink
            to={`/${currentChainId || ''}/sellTokens`}
            active={activeItem === 'Sell tokens'}
            onClick={mobileMenuToggler}
            disabled={!selectedAccount && !isLoading}
          >
            Sell tokens
          </MobileMenuLink>
          <MobileMenuLink to={`/${currentChainId || ''}/collections`}
            active={activeItem === 'My collections'}
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
          {deviceSize < DeviceSize.xl && !!accounts.size &&
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
    width: 1374px;
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
  gap: var(--gap);
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

const MenuDropdown = styled(Dropdown)`
  display: inline-grid;
  .dropdown-wrapper {
    width: auto;
  }
`;

const MobileMenuDropdown = styled(Dropdown)`
  display: inline-grid;
  padding: 8px 16px;
  .dropdown-wrapper {
    width: auto;
    .unique-text:hover {
      color: var(--color-primary-500);
      cursor: pointer;
    }
  }
`;
