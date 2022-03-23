import { Trade } from '../../../api/restApi/trades/types';
import { useEffect, useState } from 'react';
import { NFTToken } from '../../../api/chainApi/unique/types';
import { useApi } from '../../../hooks/useApi';

export const useGetTokensByTrades = (trades: Trade[]) => {
  const [isFetchingTokens, setIsFetchingTokens] = useState(true);
  const [tradesWithTokens, setTradesWithTokens] = useState<(Trade & {token: NFTToken})[]>([]);
  const { api } = useApi();

  useEffect(() => {
    const fetchToken = async (trade: Trade) => {
      return {
        ...trade,
        token: await api?.nft?.getToken(trade.collectionId, trade.tokenId) as NFTToken
      };
    };

    (async () => {
      if (!api?.nft) return;
      setIsFetchingTokens(true);
      setTradesWithTokens(await Promise.all(trades.map(fetchToken)));
      setIsFetchingTokens(false);
    })();
  }, [api?.nft, trades]);

  return {
    tradesWithTokens,
    isFetchingTokens
  };
};
