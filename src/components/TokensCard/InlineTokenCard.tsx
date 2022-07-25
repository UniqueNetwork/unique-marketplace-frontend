import React, { FC, useEffect, useState } from 'react';
import { Loader, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';

import { NFTToken } from 'api/uniqueSdk/types';
import { useApi } from 'hooks/useApi';
import { Avatar } from '../Avatar/Avatar';

interface InlineTokenCardProps {
  tokenId: number
  collectionId: number
}

export const InlineTokenCard: FC<InlineTokenCardProps> = ({ tokenId, collectionId, children }) => {
  const { api } = useApi();
  const [token, setToken] = useState<NFTToken>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!api?.nft) return;
    (async () => {
      setIsLoading(true);
      setToken((await api?.nft?.getToken(collectionId, tokenId)) || undefined);
      setIsLoading(false);
    })();
  }, [tokenId, collectionId, api?.nft]);

  return (
    <InlineTokenCardWrapper>
      <Avatar src={token?.imageUrl || ''} size={64} type={'square'} />
      {token && <TokenInfoWrapper>
        <Text size={'s'} color={'grey-500'}>{`${token?.prefix} #${token?.id}`}</Text>
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
