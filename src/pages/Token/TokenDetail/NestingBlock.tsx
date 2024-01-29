import React, { FC } from 'react';
import styled from 'styled-components';
import { Button } from 'components/UI';

import { Grey300 } from 'styles/colors';
import { TokenByIdResponse } from '@unique-nft/sdk';
import { Heading } from '@unique-nft/ui-kit';
import { blockedNestingCollections } from '../SellToken/constants';
import { useApi } from 'hooks/useApi';
import { mockWearables } from '../constants';

interface NestingTokenBlockProps {
  token?: TokenByIdResponse
  testid: string
  onNestClick(): void
  onCreateBundle(): void
  onEquipClick(): void
}

export const NestingTokenBlock: FC<NestingTokenBlockProps> = ({ token, testid, onNestClick, onCreateBundle, onEquipClick }) => {
  const { tokenOwner } = token?.collection?.permissions?.nesting || {};
  const { currentChainId } = useApi();

  const canCustomize = token?.collection.properties.find(({ key }) => key === 'is_customizable')?.value;
  const canEquip = !!mockWearables[currentChainId || '']?.find(({ collectionId }) => collectionId === token?.collectionId);

  if (blockedNestingCollections[currentChainId || '']?.includes(token?.collectionId || 0)) return null;

  return (
    <>
      <ActionsWrapper>
        <Heading size='4' >{canCustomize ? 'Customization' : 'Nesting'}</Heading>
        <ButtonsWrapper>
          {!canCustomize && !canEquip && <Button
            title={'Nest this token'}
            onClick={onNestClick}
            testid={`${testid}-transfer-button`}
          />}
          {canEquip && tokenOwner && <Button
            title={'Equip'}
            onClick={onEquipClick}
            testid={`${testid}-transfer-button`}
          />}
          {canCustomize && tokenOwner && <Button
            title={'Customize'}
            onClick={onCreateBundle}
            testid={`${testid}-transfer-button`}
          />}
        </ButtonsWrapper>
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

const ButtonsWrapper = styled.div`
  display: flex;
  gap: var(--gap);
`;
