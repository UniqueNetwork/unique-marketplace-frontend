import { post } from 'api/restApi/base';
import { useCallback, useState } from 'react';
import config from 'config';

export type TokenReport = {
  collectionId: number
  tokenId: number
  tokenPrefix: string
  message: string
}

export type AskQuestionRequest = {
  name: string
  email: string
  question: string
}

export const useZendeskRequest = () => {
  const [isLoading, setIsLoading] = useState(false);

  const report = useCallback(async ({ collectionId, tokenId, tokenPrefix, message }: TokenReport) => {
    if (!config.zendeskApi || !config.zenDeskToken) return;
    setIsLoading(true);
    const response = await post(`${config.zendeskApi}/tickets`,
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

  const askQuestion = useCallback(async ({ name, email, question }: AskQuestionRequest) => {
    if (!config.zendeskApi || !config.zenDeskToken) return;
    setIsLoading(true);
    const response = await post(`${config.zendeskApi}/tickets`,
      {
        ticket: {
          comment: {
            body: 'From Unique Market'
          },
          priority: 'urgent',
          subject: `Name: ${name}, Email: ${email}, Question: ${question}.`
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
    report,
    askQuestion
  };
};
