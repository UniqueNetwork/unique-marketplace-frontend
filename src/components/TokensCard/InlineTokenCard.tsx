import React, { FC, useEffect, useState } from 'react';
import { Loader, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';

import { useApi } from 'hooks/useApi';
import { Avatar } from '../Avatar/Avatar';
import { TokenByIdResult } from '@unique-nft/substrate-client/tokens';
import { useCollections } from 'hooks/useCollections';

interface InlineTokenCardProps {
  tokenId: number
  collectionId: number
  testid?: string
}

export const InlineTokenCard: FC<InlineTokenCardProps> = ({ tokenId, collectionId, children, testid }) => {
  const { api } = useApi();
  const { getCollection } = useCollections();
  const [token, setToken] = useState<TokenByIdResult>();
  const [prefix, setPrefix] = useState<string>();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!api?.nft) return;
    (async () => {
      setIsLoading(true);
      setToken((await api.nft?.getToken(collectionId, tokenId)) || undefined);
      const { tokenPrefix } = await getCollection(collectionId) || { tokenPrefix: '' };
      setPrefix(tokenPrefix);
      setIsLoading(false);
    })();
  }, [tokenId, collectionId, api?.nft]);

  return (
    <InlineTokenCardWrapper>
      <Avatar src={token?.image || ''}
        size={64}
        type={'square'}
        testid={`${testid}-token-image`}
      />
      {token && <TokenInfoWrapper>
        <Text size={'s'} color={'grey-500'} testid={`${testid}-token-title`}>{`${prefix} #${token?.tokenId}`}</Text>
        {children}
      </TokenInfoWrapper>}
      {isLoading && <Loader isFullPage />}
    </InlineTokenCardWrapper>
  );
};

export default InlineTokenCard;

const InlineTokenCardWrapper = styled.div`
  display: flex;
  column-gap: var(--gap);
  position: relative;
  align-items: center;
`;

const TokenInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
