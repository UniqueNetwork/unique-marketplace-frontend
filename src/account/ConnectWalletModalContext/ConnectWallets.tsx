import { useCallback, useContext, useState } from 'react';
import styled from 'styled-components';
import { Ethereum } from '@unique-nft/utils/extension';
import { ConnectWalletModalContext } from './ConnectWalletModalContext';
import { useAccounts } from 'hooks/useAccounts';
import { Button, Icon, Modal } from 'components/UI';
import { Heading } from '@unique-nft/ui-kit';
import { CreateAccountModal } from 'pages/Accounts/Modals/CreateAccount';
import { ImportViaSeedAccountModal } from 'pages/Accounts/Modals/ImportViaSeed';
import { ImportViaJSONAccountModal } from 'pages/Accounts/Modals/ImportViaJson';
import { ExtensionMissingModal, Extensions } from './ExtensionMissing';
import SubWalletIcon from 'static/icons/subwallet.svg';

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
        <p>Create or import an existing one in any suitable way:</p>
        <Buttons>
          <Button
            title='Seed phrase'
            role='primary'
            onClick={handleOpenModal(AccountModal.VIA_SEED)}
          />
          <Button title='New substrate account' onClick={onCreateAccountClick} />
          <Button
            title='Backup JSON file'
            onClick={handleOpenModal(AccountModal.VIA_JSON)}
          />
        </Buttons>

        <p>You can also create or connect wallets via these providers:</p>
        <Wallets>
          <WalletItem onClick={handleConnectToPolkadotExtension}>
            <Icon size={40} name='polkadot-wallet' /> <span>Polkadot.js</span>
          </WalletItem>
          <WalletItem onClick={handleConnectToMetamask}>
            <Icon size={40} name='metamask-wallet' /> <span>Metamask</span>
          </WalletItem>
          <WalletItem onClick={handleConnectToTalismanExtension}>
            <Icon size={40} name='talisman-wallet' /> <span>Talisman</span>
          </WalletItem>
          <WalletItem onClick={handleConnectToSubWalletExtension}>
            <Icon file={SubWalletIcon} size={40} />
            <span>SubWallet</span>
          </WalletItem>
        </Wallets>
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
  &>div {
    width: 45%;
  }
`;

const WalletItem = styled.div`
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--color-grey-100);
  box-sizing: border-box;
  padding: 11px 27px;
  flex: 1 1 auto;
  cursor: pointer;
  border-radius: calc(var(--prop-gap) / 2);

  span {
    margin-left: 10px;
    font-size: 18px;
    font-weight: 500;
    color: var(--color-additional-dark);
  }
`;

const Buttons = styled.div`
  margin: var(--prop-gap) 0 calc(var(--prop-gap) * 2);
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--prop-gap) / 2);

  & > button {
    flex: 1 1 calc(50% - 10px);
    &:first-child {
      flex: 1 1 100%;
    }
  }
`;
