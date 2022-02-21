import React, { useEffect, useState } from 'react';
import { useAccounts } from './useAccounts';

export const useAccount = () => {
  const [allAccounts] = useAccounts();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // TODO: save to local storage as last used account
  const [selectedAccount, setSelectedAccount] = useState(allAccounts?.length && allAccounts[0]);

  useEffect(() => {
    setIsLoading(false);
    if (!selectedAccount && allAccounts?.length) setSelectedAccount(allAccounts[0]);
    else {
      // check if updated account still presented
    }
  }, [allAccounts]);

  return {
    isLoading,
    selectedAccount,
    setSelectedAccount
  };
};
