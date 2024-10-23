import { FC, useMemo, useState, ReactNode } from 'react';

import { ConnectWalletModalContext } from './ConnectWalletModalContext';
import { ConnectWallets } from './ConnectWallets';

interface ConnectWalletModalProviderProps {
  children: ReactNode;
}

export const ConnectWalletModalProvider: FC<ConnectWalletModalProviderProps> = ({ children }) => {
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
