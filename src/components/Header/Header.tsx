import { FCC, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Dropdown, Icon, Text } from '../UI';

import { useScreenWidthFromThreshold } from 'hooks/useScreenWidthFromThreshold';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { useAccounts } from 'hooks/useAccounts';
import { useApi } from 'hooks/useApi';
import { TMenuItems } from '../PageLayout';
import { WalletManager } from './WalletManager/WalletManager';
import { DesktopMenuItem, DesktopMenuLink, MobileMenuLink } from './MenuLink';
import { GetButton } from './GetButton';

interface HeaderProps {
  activeItem: TMenuItems;
}

export const Header: FCC<HeaderProps> = ({ activeItem }) => {
  const { lessThanThreshold: showMobileMenu } =
    useScreenWidthFromThreshold(1279);
  const [mobileMenuIsOpen, toggleMobileMenu] = useState(false);
  const { selectedAccount, isLoading, accounts } = useAccounts();
  const { currentChainId } = useApi();
  const navigate = useNavigate();

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
            <DesktopMenuLink to={`/${currentChainId || ''}/market`} active={activeItem === undefined}>
              Explore
            </DesktopMenuLink>
            {/* <MenuDropdown
              options={[
                {
                  title: 'NFT',
                  url: `/${currentChainId || ''}/create-token`
                },
                {
                  title: 'Collection',
                  url: `/${currentChainId || ''}/create-collection`
                }
              ]}
              optionKey='title'
              optionValue='title'
              onChange={({ url }) => {
                navigate(url as string);
              }}
              optionRender={(option) => {
                return <DesktopMenuItem>{option.title as string}</DesktopMenuItem>;
              }}
            >
              <DesktopMenuItem $active={activeItem === 'Create collection' || activeItem === 'Create tokens'}>Create</DesktopMenuItem>
            </MenuDropdown> */}
            <DesktopMenuLink to={`/${currentChainId || ''}/create-token`} active={activeItem === 'Create tokens' || activeItem === 'Create collection'}>
              Create
            </DesktopMenuLink>
            <DesktopMenuLink to={`/${currentChainId || ''}/sellTokens`} active={activeItem === 'My NFTs'} disabled={!selectedAccount || isLoading}>
              My NFTs
            </DesktopMenuLink>
            <DesktopMenuLink to={`/${currentChainId || ''}/collections`} active={activeItem === 'My collections'} disabled={!selectedAccount || isLoading}>
              My collections
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
          <MobileMenuLink to={`/${currentChainId || ''}/market`} active={activeItem === undefined} onClick={mobileMenuToggler}>
            Explore
          </MobileMenuLink>
          {/* <MobileMenuDropdown
            options={[
                {
                  title: 'NFT',
                  url: `/${currentChainId || ''}/create-token`
                },
                {
                  title: 'Collection',
                  url: `/${currentChainId || ''}/create-collection`
                }
              ]}
            optionValue='title'
            optionKey='title'
            onChange={({ url }) => {
              mobileMenuToggler();
              navigate(url as string);
            }}
          >
            <Text color = 'additional-dark'>Create</Text>
          </MobileMenuDropdown> */}
          <MobileMenuLink
            to={`/${currentChainId || ''}/create-token`}
            active={activeItem === 'Create tokens' || activeItem === 'Create collection'}
            onClick={mobileMenuToggler}
          >
            Create
          </MobileMenuLink>
          <MobileMenuLink
            to={`/${currentChainId || ''}/sellTokens`}
            active={activeItem === 'My NFTs'}
            onClick={mobileMenuToggler}
            disabled={!selectedAccount && !isLoading}
          >
            My NFTs
          </MobileMenuLink>
          <MobileMenuLink to={`/${currentChainId || ''}/collections`}
            active={activeItem === 'My collections'}
            onClick={mobileMenuToggler}
            disabled={!selectedAccount && !isLoading}
          >
            My collections
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
  gap: var(--prop-gap);
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
