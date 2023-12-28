import { FC, useMemo, useState } from 'react';

import { CONNECTED_WALLET_TYPE } from '../useWalletCenter';

import { ConnectWalletModalContext } from './ConnectWalletModalContext';
import { ConnectWallets } from './ConnectWallets';

const getConnectedWallets = localStorage.getItem(CONNECTED_WALLET_TYPE);

export const ConnectWalletModalProvider: FC = ({ children }) => {
  const [isOpenConnectWalletModal, setIsOpenConnectWalletModal] = useState<boolean>(
    false
  );

  return (
    <ConnectWalletModalContext.Provider
      value={useMemo(
        () => ({
          isOpenConnectWalletModal,
          setIsOpenConnectWalletModal
        }),
        [isOpenConnectWalletModal]
      )}
    >
      {children}
      <ConnectWallets />
    </ConnectWalletModalContext.Provider>
  );
};
