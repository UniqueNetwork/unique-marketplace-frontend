import React from 'react';
import { Link } from 'react-router-dom';
import { Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { NFTToken } from '../../../api/chainApi/unique/types';
import { Avatar } from '../../../components/Avatar/Avatar';

export const TokenComponent = ({ token }: { token: NFTToken | undefined }) => {
  return <Link to={`/token/${token?.collectionId}/${token?.id}`}>
    <TokenComponentWrapper>
      <Avatar src={token?.imageUrl || ''} size={40} type={'square'} />
      <Text>{`${token?.prefix} #${token?.id}`}</Text>
    </TokenComponentWrapper>
  </Link>;
};

const TokenComponentWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
  align-items: center;
  padding: calc(var(--gap) / 2) 0 !important;
`;
