import { post } from 'api/restApi/base';
import { useCallback, useState } from 'react';
import config from 'config';

type TokenReport = {
  collectionId: number
  tokenId: number
  tokenPrefix: string
  message: string
}

export const useZendeskRequest = () => {
  const [isLoading, setIsLoading] = useState(false);

  const report = useCallback(async ({ collectionId, tokenId, tokenPrefix, message }: TokenReport) => {
    if (!config.zendeskApi || !config.zenDeskToken) return;
    setIsLoading(true);
    const response = await post(config.zendeskApi,
      {
        ticket: {
          comment: {
            body: 'From Unique Market'
          },
          priority: 'urgent',
          subject: `Token: ${tokenPrefix} #${tokenId}, collection: ${collectionId}, Report: ${message}.`
        }
      },
      {
        headers: {
          Authorization: `Bearer ${config.zenDeskToken}`
        }
      }
    );
    setIsLoading(false);
    return response;
  }, []);

  return {
    isLoading,
    report
  };
};
