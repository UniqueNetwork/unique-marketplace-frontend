import React, { FC } from 'react';
import styled from 'styled-components';
import { Button } from 'components/UI';

import { Grey300 } from 'styles/colors';
import { TokenByIdResponse } from '@unique-nft/sdk';
import { Heading } from '@unique-nft/ui-kit';

interface NestingTokenBlockProps {
  token?: TokenByIdResponse
  testid: string
  onNestClick(): void
}

export const NestingTokenBlock: FC<NestingTokenBlockProps> = ({ token, testid, onNestClick }) => {
  const { tokenOwner } = token?.collection?.permissions?.nesting || {};

  if (!tokenOwner) return null;

  return (
    <>
      <ActionsWrapper>
        <Heading size='4' >Nesting</Heading>
        <Button
          title={'Nest this token'}
          onClick={onNestClick}
          testid={`${testid}-transfer-button`}
        />
      </ActionsWrapper>
      <Divider />
    </>
  );
};

const ActionsWrapper = styled.div`
  display: flex;
  row-gap: var(--gap);
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;

const Divider = styled.div`
  margin: calc(var(--gap) * 1.5) 0;
  border-top: 1px dashed ${Grey300};
`;
