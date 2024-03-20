
import { get } from 'api/restApi/base';
import { useCallback, useState } from 'react';

const baseURL = 'https://api.coingecko.com/api/v3/';

export const useCoinGeckoApi = () => {
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const fetchCryptoCurrency = useCallback(async () => {
    setIsFetching(true);
    const { data } = await get<{'unique-network': { usd: number }}>(`${baseURL}simple/price?ids=unique-network&vs_currencies=usd`);
    setIsFetching(false);
    return data['unique-network'].usd;
  }, []);

  return { fetchCryptoCurrency, isFetching };
};
