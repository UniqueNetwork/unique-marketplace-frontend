import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Ethereum, Polkadot } from '@unique-nft/utils/extension';
import { ConnectWalletModalContext } from './ConnectWalletModalContext';
import { useAccounts } from 'hooks/useAccounts';
import { Button, Icon, Modal } from 'components/UI';
import { Heading, Loader } from '@unique-nft/ui-kit';
import { CreateAccountModal } from 'pages/Accounts/Modals/CreateAccount';
import { ImportViaSeedAccountModal } from 'pages/Accounts/Modals/ImportViaSeed';
import { ImportViaJSONAccountModal } from 'pages/Accounts/Modals/ImportViaJson';
import { ExtensionMissingModal, Extensions } from './ExtensionMissing';
import SubWalletIcon from 'static/icons/subwallet.svg';
import EnkriptIcon from 'static/icons/enkrypt.svg';
import NovaWalletIcon from 'static/icons/nova_icon_radial.svg';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';

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
  const [missingExtension, setMissingExtension] = useState<Extensions>();
  const { walletsCenter, showSignDialog, fetchAccounts } = useAccounts();

  const onCreateAccountClick = useCallback(() => {
    setCurrentModal(AccountModal.CREATE);
  }, []);

  const onChangeAccountsFinish = useCallback(() => {
    setCurrentModal(undefined);
    setIsOpenConnectWalletModal(false);
  }, []);

  const handleOpenModal = (modalType: AccountModal) => () => {
    setCurrentModal(modalType);
  };

  const handleConnectToMetamask = async () => {
    try {
      await Ethereum.requestAccounts();
      await walletsCenter.connectWallet('metamask');
      fetchAccounts();
      setIsOpenConnectWalletModal(false);
    } catch (e: any) {
      setMissingExtension('Metamask');
      setCurrentModal(AccountModal.EXTENSION_MISSING);
    }
  };

  const handleConnectToPolkadotExtension = async () => {
    try {
      await walletsCenter.connectWallet('polkadot-js');
      await walletsCenter.connectWallet('keyring', {
        requestPasswordCallback: showSignDialog
      });
      fetchAccounts();
      setIsOpenConnectWalletModal(false);
    } catch (e: any) {
      console.log(e);
      setMissingExtension('Polkadot');
      setCurrentModal(AccountModal.EXTENSION_MISSING);
    }
  };

  const handleConnectToTalismanExtension = async () => {
    try {
      await walletsCenter.connectWallet('talisman');
      fetchAccounts();
      setIsOpenConnectWalletModal(false);
    } catch (e: any) {
      setMissingExtension('Talisman');
      setCurrentModal(AccountModal.EXTENSION_MISSING);
    }
  };

  const handleConnectToSubWalletExtension = async () => {
    try {
      await walletsCenter.connectWallet('subwallet-js');
      fetchAccounts();
      setIsOpenConnectWalletModal(false);
    } catch (e: any) {
      setMissingExtension('SubWallet');
      setCurrentModal(AccountModal.EXTENSION_MISSING);
    }
  };

  const handleConnectToEnkryptExtension = async () => {
    try {
      await walletsCenter.connectWallet('enkrypt');
      fetchAccounts();
      setIsOpenConnectWalletModal(false);
    } catch (e: any) {
      setMissingExtension('Enkrypt');
      setCurrentModal(AccountModal.EXTENSION_MISSING);
    }
  };

  const handleConnectToNovaWallet = async () => {
    try {
      await walletsCenter.connectWallet('polkadot-js');
      fetchAccounts();
      setIsOpenConnectWalletModal(false);
    } catch (e: any) {
      setMissingExtension('NovaWallet');
      setCurrentModal(AccountModal.EXTENSION_MISSING);
    }
  };

  const isMobile = DeviceSize.sm >= useDeviceSize();
  console.log(isMobile);

  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);

  useEffect(() => {
    void (async () => {
      setIsFetching(true);
      const wallets = await Polkadot.listWallets();
      const canConnectMetamask = window.ethereum?.isMetaMask;
      console.log(wallets, canConnectMetamask);
      setAvailableWallets(wallets.wallets.map(({ name }) => name));
      setIsFetching(false);
    })();
  }, []);

  const noAvailableWallets = availableWallets.length === 0;

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
          {availableWallets.includes('polkadot-js') && !isMobile && <WalletItem onClick={handleConnectToPolkadotExtension}>
            <Icon size={40} name='polkadot-wallet' /> <span>Polkadot.js</span>
          </WalletItem>}
          {(window.ethereum?.isMetaMask || noAvailableWallets) && <WalletItem onClick={handleConnectToMetamask}>
            <Icon size={40} name='metamask-wallet' /> <span>Metamask</span>
          </WalletItem>}
          {availableWallets.includes('talisman') && <WalletItem onClick={handleConnectToTalismanExtension}>
            <Icon size={40} name='talisman-wallet' /> <span>Talisman</span>
          </WalletItem>}
          {(availableWallets.includes('subwallet-js') || noAvailableWallets) && <WalletItem onClick={handleConnectToSubWalletExtension}>
            <Icon file={SubWalletIcon} size={40} />
            <span>SubWallet</span>
          </WalletItem>}
          {availableWallets.includes('enkrypt') && <WalletItem onClick={handleConnectToEnkryptExtension}>
            <Icon file={EnkriptIcon} size={40} />
            <span>Enkrypt</span>
          </WalletItem>}
          {(window.walletExtension?.isNovaWallet || noAvailableWallets) && <WalletItem onClick={handleConnectToNovaWallet}>
            <Icon file={NovaWalletIcon} size={40} />
            <span>Nova Wallet</span>
          </WalletItem>}
        </Wallets>
        {isFetching && <Loader />}
      </Modal>

      <CreateAccountModal
        isVisible={currentModal === AccountModal.CREATE}
        onFinish={onChangeAccountsFinish}
        onClose={() => setCurrentModal(undefined)}
      />
      <ImportViaSeedAccountModal
        isVisible={currentModal === AccountModal.VIA_SEED}
        onFinish={onChangeAccountsFinish}
        onClose={() => setCurrentModal(undefined)}
      />
      <ImportViaJSONAccountModal
        isVisible={currentModal === AccountModal.VIA_JSON}
        onFinish={onChangeAccountsFinish}
        onClose={() => setCurrentModal(undefined)}
      />
      <ExtensionMissingModal
        isVisible={currentModal === AccountModal.EXTENSION_MISSING}
        missingExtension={missingExtension}
        onFinish={() => setCurrentModal(undefined)}
      />
    </>
  );
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
