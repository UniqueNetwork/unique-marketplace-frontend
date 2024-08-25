import { FCC, useMemo, useState } from 'react';

import { ConnectWalletModalContext } from './ConnectWalletModalContext';
import { ConnectWallets } from './ConnectWallets';

export const ConnectWalletModalProvider: FCC = ({ children }) => {
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
