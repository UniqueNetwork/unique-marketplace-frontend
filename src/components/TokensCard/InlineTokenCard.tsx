import React, { FC, useEffect, useState } from 'react';
import { Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { Avatar } from '../Avatar/Avatar';
import { NFTToken } from '../../api/chainApi/unique/types';
import { useApi } from '../../hooks/useApi';
import Loading from '../Loading';

interface InlineTokenCardProps {
  tokenId: number
  collectionId: number
  text?: string
}

export const InlineTokenCard: FC<InlineTokenCardProps> = ({ tokenId, collectionId, text }) => {
  const { api } = useApi();
  const [token, setToken] = useState<NFTToken>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!api?.nft) return;
    (async () => {
      setIsLoading(true);
      setToken(await api?.nft?.getToken(collectionId, tokenId));
      setIsLoading(false);
    })();
  }, [tokenId, collectionId, api?.nft]);

  return (
    <InlineTokenCardWrapper>
      <Avatar src={token?.imageUrl || ''} size={64} type={'square'} />
      {token && <TokenInfoWrapper>
        <Text size={'s'} color={'grey-500'}>{`${token?.prefix} #${token?.id}`}</Text>
        {text && <Text size={'m'} >{text}</Text>}
      </TokenInfoWrapper>}
      {isLoading && <Loading />}
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
