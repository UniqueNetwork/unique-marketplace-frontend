import { get } from 'api/restApi/base';
import { defaultParams } from '../base/axios';
import { useEffect, useState } from 'react';
import { Banner } from './types';
import config from 'config';
import { useApi } from 'hooks/useApi';

const endpoint = '/banners';

export const getBanners = (baseURL: string) => get<{ banners: Banner[] }>(`${endpoint}`, { ...defaultParams, baseURL });

export const useGetBanners = () => {
  const { currentChainId } = useApi();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!currentChainId) return;
    void (async () => {
      setIsFetching(true);
      const { data, status } = await getBanners(config.blockchains[currentChainId].apiEndpoint);
      if (status === 200) {
        setBanners(data?.banners.sort((a, b) => a.sortIndex > b.sortIndex ? 1 : -1));
      }
      setIsFetching(false);
    })();
  }, [currentChainId]);

  return {
    banners,
    isFetching
  };
};
