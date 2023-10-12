import { useCallback, useContext, useEffect } from 'react';

import AccountContext from 'account/AccountContext';

export const useAccounts = () => {
  return useContext(AccountContext);
};
