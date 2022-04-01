import { Trade } from '../../../api/restApi/trades/types';
import { useEffect, useState } from 'react';
import { NFTToken } from '../../../api/chainApi/unique/types';
import { useApi } from '../../../hooks/useApi';

export const useGetTokensByTrades = (trades: Trade[]) => {
  const [isFetchingTokens, setIsFetchingTokens] = useState(true);
  const [tradesWithTokens, setTradesWithTokens] = useState<(Trade & {token: NFTToken, collection: { id?: string, name?: string }})[]>([]);
  const { api } = useApi();

  useEffect(() => {
    const fetchToken = async (trade: Trade) => {
      const token = await api?.nft?.getToken(trade.collectionId, trade.tokenId) as NFTToken;
      return {
        ...trade,
        token,
        collection: {
          id: token.collectionId?.toString(),
          name: token.collectionName
        }
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
