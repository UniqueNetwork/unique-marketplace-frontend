import { useEffect, useState } from 'react';

import { get, post } from '../base';
import { defaultParams } from '../base/axios';
import { Settings, WhitelistBody } from './types';
import { ResponseError } from '../base/types';

const endpoint = '/api/settings';

export const getSettings = () => get<Settings>(`${endpoint}`, { ...defaultParams });

export const addToWhitelist = (body: WhitelistBody, signature: string) => post(`${endpoint}/allowed_list/${body.account}`, null, { headers: { ...defaultParams.headers, Authorization: `Bearer ${signature}` }, params: body, ...defaultParams });

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings | undefined>();
  const [isFetching, setIsFetching] = useState<boolean | undefined>(false);
  const [fetchingError, setFetchingError] = useState<ResponseError | undefined>();

  useEffect(() => {
    setIsFetching(true);
    getSettings()
      .then((response) => {
        setIsFetching(false);
        if (response.status === 200) {
          setIsFetching(false);
          setSettings(response.data);
        }
      })
      .catch((error) => {
        setFetchingError(error);
      });
  }, []);

  return {
    settings,
    isFetching,
    fetchingError
  };
};
