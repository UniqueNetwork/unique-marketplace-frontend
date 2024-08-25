import React, { FCC, useEffect, useState } from 'react';
import { Loader, Text } from 'components/UI';
import styled from 'styled-components';

import { useApi } from 'hooks/useApi';
import { Avatar } from '../Avatar/Avatar';
import { useCollections } from 'hooks/useCollections';
import { TokenByIdResponse } from '@unique-nft/sdk';

interface InlineTokenCardProps {
  tokenId: number
  collectionId: number
  testid?: string
}

export const InlineTokenCard: FCC<InlineTokenCardProps> = ({ tokenId, collectionId, children, testid }) => {
  const { api } = useApi();
  const { getCollection } = useCollections();
  const [token, setToken] = useState<TokenByIdResponse>();
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
  column-gap: var(--prop-gap);
  position: relative;
  align-items: center;
`;

const TokenInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
