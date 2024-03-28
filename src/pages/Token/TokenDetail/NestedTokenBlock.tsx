import React, { FC } from 'react';
import styled from 'styled-components';
import { Button } from 'components/UI';

import { Grey300 } from 'styles/colors';
import { TokenByIdResponse } from '@unique-nft/sdk';
import { useApi } from 'hooks/useApi';
import { blockedNestingCollections } from '../SellToken/constants';

interface NestedTokenBlockProps {
  token?: TokenByIdResponse
  testid: string
  onTransferClick(): void
  onUnnestClick(): void
}

export const NestedTokenBlock: FC<NestedTokenBlockProps> = ({ token, testid, onTransferClick, onUnnestClick }) => {
  const { tokenOwner } = token?.collection?.permissions?.nesting || {};
  const { currentChainId } = useApi();

  if (!tokenOwner || blockedNestingCollections[currentChainId || '']?.includes(token?.collectionId || 0)) return null;

  return (
    <>
      <ActionsWrapper>
        <Button
          title={'Transfer'}
          onClick={onTransferClick}
          testid={`${testid}-transfer-button`}
        />
        <Button
          title={'Unnest'}
          role='danger'
          onClick={onUnnestClick}
          testid={`${testid}-transfer-button`}
        />
      </ActionsWrapper>
      <Divider />
    </>
  );
};

const ActionsWrapper = styled.div`
  display: flex;
  column-gap: var(--prop-gap);
`;

const Divider = styled.div`
  margin: calc(var(--prop-gap) * 1.5) 0;
  border-top: 1px dashed ${Grey300};
`;
