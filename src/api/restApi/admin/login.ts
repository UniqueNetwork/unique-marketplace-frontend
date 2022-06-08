import { useCallback, useMemo, useState } from 'react';

import { post } from '../base';
import { defaultParams } from '../base/axios';
import { LoginPayload, LoginResponse } from './types';
import { useAccounts } from '../../../hooks/useAccounts';
import { compareEncodedAddresses } from '../../chainApi/utils/addressUtils';
import { JWTDecode } from '../../../utils/JWTDecode';

export const JWTokenLocalStorageKey = 'unique_market_jwt';

const endpoint = '/api/admin/login';

const logInMessage = '/api/admin/login';

export const adminLogIn = (body: LoginPayload, signature: string) => post<any, LoginResponse>(`${endpoint}`, null, { headers: { ...defaultParams.headers, Signature: signature }, params: body, ...defaultParams });

export const useAdminLoggingIn = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { selectedAccount, signMessage } = useAccounts();

  const hasAdminPermission: boolean = useMemo(() => {
    console.log(localStorage.getItem(JWTokenLocalStorageKey));
    return !!localStorage.getItem(JWTokenLocalStorageKey);
  }, [selectedAccount?.address]);

  const logIn = useCallback(async () => {
    if (!selectedAccount?.address) return null;
    setIsLoggingIn(true);
    let signature;
    try {
      signature = await signMessage(logInMessage);
    } catch (e) {
      console.error('Administrator authorization failed', e);
      return null;
    }
    const response = await adminLogIn({
      account: selectedAccount.address
    }, signature);

    setIsLoggingIn(false);
    if (response.status === 200) {
      localStorage.setItem(JWTokenLocalStorageKey, response.data.accessToken);
      return response.data.accessToken;
    }
    return null;
  }, [selectedAccount, signMessage]);

  const getJWToken = useCallback(async () => {
    if (!selectedAccount?.address) return null;
    const jwToken = localStorage.getItem(JWTokenLocalStorageKey);

    if (!jwToken) return await logIn();

    // Check time of JWToken is expired
    const { exp } = JWTDecode(jwToken);
    if (exp * 1000 <= Date.now()) {
      // TODO: refresh token
      logOut();
      return logIn();
    }

    return jwToken;
  }, [logIn]);

  const logOut = useCallback(() => {
    localStorage.removeItem(JWTokenLocalStorageKey);
  }, []);

  return {
    isLoggingIn,
    hasAdminPermission,
    logIn,
    getJWToken,
    logOut
  };
};
