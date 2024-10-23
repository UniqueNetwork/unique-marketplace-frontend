import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Ethereum, Polkadot } from '@unique-nft/utils/extension';
import { ConnectWalletModalContext } from './ConnectWalletModalContext';
import { useAccounts } from 'hooks/useAccounts';
import { Heading, Icon, Loader, Modal } from 'components/UI';
import { ExtensionMissingModal } from './ExtensionMissing';
import SubWalletIcon from 'static/icons/subwallet.svg';
import EnkriptIcon from 'static/icons/enkrypt.svg';
import NovaWalletIcon from 'static/icons/nova_icon_radial.svg';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { ConnectedWalletsName } from 'account/useWalletCenter';
import WalletConnect from 'static/images/walletconnect.png';
import { useWeb3Modal } from '@web3modal/wagmi/react';

enum AccountModal {
  CREATE = 'create',
  VIA_SEED = 'importViaSeed',
  VIA_JSON = 'importViaJSON',
  VIA_QR = 'importViaQRCode',
  EXTENSION_MISSING = 'extensionMissing',
}

export const ConnectWallets = () => {
  const { isOpenConnectWalletModal, setIsOpenConnectWalletModal } = useContext(
    ConnectWalletModalContext
  );
  const [currentModal, setCurrentModal] = useState<AccountModal | undefined>();
  const [missingExtension, setMissingExtension] = useState<ConnectedWalletsName>();
  const { walletsCenter, fetchAccounts } = useAccounts();

  const handleConnectToMetamask = async () => {
    try {
      await Ethereum.requestAccounts();
      await walletsCenter.connectWallet('metamask');
      fetchAccounts();
      setIsOpenConnectWalletModal(false);
    } catch (e: any) {
      setMissingExtension('metamask');
      setCurrentModal(AccountModal.EXTENSION_MISSING);
    }
  };

  const openWalletConnect = () => {
    open();
    setIsOpenConnectWalletModal(false);
  };

  const handleConnectToPolkadotExtension = (walletName: ConnectedWalletsName = 'polkadot-js') => async () => {
    try {
      await walletsCenter.connectWallet(walletName);
      fetchAccounts();
      setIsOpenConnectWalletModal(false);
    } catch (e: any) {
      console.log(e);
      setMissingExtension(walletName);
      setCurrentModal(AccountModal.EXTENSION_MISSING);
    }
  };

  const { open } = useWeb3Modal();

  const isMobile = DeviceSize.sm >= useDeviceSize();
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);

  useEffect(() => {
    void (async () => {
      setIsFetching(true);
      const wallets = await Polkadot.listWallets();
      setAvailableWallets(wallets.wallets.map(({ name }) => name));
      setIsFetching(false);
    })();
  }, []);

  const noAvailableWallets = availableWallets.length === 0;

  if (isMobile) {
    return (
      <>
        <Modal
          isVisible={isOpenConnectWalletModal}
          onClose={() => {
            setIsOpenConnectWalletModal(false);
          }}
          isClosable
        >
          <Heading size='2'>Connect wallet</Heading>
          <p>Choose how you want to connect. If you don&apos;t have a wallet, you can select a provider and create one.</p>
          <Wallets>
            {availableWallets.includes('polkadot-js') && <WalletItem onClick={handleConnectToPolkadotExtension()}>
              <Icon size={40} name='polkadot-wallet' /> <span>Polkadot.js</span>
            </WalletItem>}
            <WalletItem onClick={openWalletConnect}>
              <ImgWalletConnect src={WalletConnect}/> <span>WalletConnect</span>
            </WalletItem>
            {availableWallets.includes('talisman') && <WalletItem onClick={handleConnectToPolkadotExtension('talisman')}>
              <Icon size={40} name='talisman-wallet' /> <span>Talisman</span>
            </WalletItem>}
            {(availableWallets.includes('subwallet-js') || noAvailableWallets) && <WalletItem
              onClick={handleConnectToPolkadotExtension('subwallet-js')}
            >
              <Icon file={SubWalletIcon} size={40} />
              <span>SubWallet</span>
            </WalletItem>}
            {availableWallets.includes('enkrypt') && <WalletItem
              onClick={handleConnectToPolkadotExtension('enkrypt')}
            >
              <Icon file={EnkriptIcon} size={40} />
              <span>Enkrypt</span>
            </WalletItem>}
            {(window.walletExtension?.isNovaWallet || noAvailableWallets) && <WalletItem
              onClick={handleConnectToPolkadotExtension('novawallet')}
            >
              <Icon file={NovaWalletIcon} size={40} />
              <span>Nova Wallet</span>
            </WalletItem>}
          </Wallets>
          {isFetching && <Loader />}
        </Modal>
        <ExtensionMissingModal
          isVisible={currentModal === AccountModal.EXTENSION_MISSING}
          missingExtension={missingExtension}
          onFinish={() => setCurrentModal(undefined)}
        />
      </>
    );
  }

  return <>
    <Modal
      isVisible={isOpenConnectWalletModal}
      onClose={() => {
      setIsOpenConnectWalletModal(false);
    }}
      isClosable
    >
      <Heading size='2'>Connect wallet</Heading>
      <p>Choose how you want to connect. If you don&apos;t have a wallet, you can select a provider and create one.</p>
      <Wallets>
        <WalletItem onClick={handleConnectToPolkadotExtension()}>
          <Icon size={40} name='polkadot-wallet' /> <span>Polkadot.js</span>
        </WalletItem>
        <WalletItem onClick={openWalletConnect}>
          <ImgWalletConnect src={WalletConnect}/> <span>WalletConnect</span>
        </WalletItem>
        <WalletItem onClick={handleConnectToPolkadotExtension('talisman')}>
          <Icon size={40} name='talisman-wallet' /> <span>Talisman</span>
        </WalletItem>
        <WalletItem onClick={handleConnectToPolkadotExtension('subwallet-js')}>
          <Icon file={SubWalletIcon} size={40} />
          <span>SubWallet</span>
        </WalletItem>
        <WalletItem onClick={handleConnectToPolkadotExtension('enkrypt')}>
          <Icon file={EnkriptIcon} size={40} />
          <span>Enkrypt</span>
        </WalletItem>
        {(window.walletExtension?.isNovaWallet || noAvailableWallets) && <WalletItem
          onClick={handleConnectToPolkadotExtension('novawallet')}
        >
          <Icon file={NovaWalletIcon} size={40} />
          <span>Nova Wallet</span>
        </WalletItem>}
      </Wallets>
      {isFetching && <Loader />}
    </Modal>
    <ExtensionMissingModal
      isVisible={currentModal === AccountModal.EXTENSION_MISSING}
      missingExtension={missingExtension}
      onFinish={() => setCurrentModal(undefined)}
    />
  </>;
};

const Wallets = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: var(--prop-gap);
  gap: calc(var(--prop-gap) / 2);
  &>a {
    width: calc(50% - 6px);
  }
  @media (max-width: 768px) {
    &>a {
        width: 100%;
    }
  }
  svg {
    min-width: 40px;
  }
  @media (max-width: 768px) {
    &>div {
      width: 100%;
    }
  }
`;

const WalletItem = styled.a`
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--color-grey-100);
  box-sizing: border-box;
  padding: 11px 27px;
  cursor: pointer;
  border-radius: calc(var(--prop-gap) / 2);
  span {
    margin-left: 10px;
    font-size: 18px;
    font-weight: 500;
    color: var(--color-additional-dark);
  }
  svg {
    min-width: 40px;
  }
`;

const ImgWalletConnect = styled.img`
  border-radius: 8px;
  widht: 40px;
  height: 40px;
`;