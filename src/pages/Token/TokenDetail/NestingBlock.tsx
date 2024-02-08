import React, { FC } from 'react';
import styled from 'styled-components';
import { Button } from 'components/UI';

import { Grey300 } from 'styles/colors';
import { CollectionInfoWithSchemaResponse, TokenByIdResponse } from '@unique-nft/sdk';
import { Heading } from '@unique-nft/ui-kit';
import { blockedNestingCollections } from '../SellToken/constants';
import { useApi } from 'hooks/useApi';
import { mockWearables } from '../constants';
import { CustomizableBlock } from './CustomizableBlock';
import { Offer } from 'api/restApi/offers/types';

interface NestingTokenBlockProps {
  token?: TokenByIdResponse
  collection?: CollectionInfoWithSchemaResponse | undefined
  offer?: Offer | undefined
  isOwner?: boolean
  isNested?: boolean
  testid: string
  onNestClick(): void
  onCreateBundle(): void
  onEquipClick(): void
  onUnequipClick(): void
}

export const NestingTokenBlock: FC<NestingTokenBlockProps> = ({
  token,
  offer,
  collection,
  isNested,
  isOwner,
  testid,
  onNestClick,
  onCreateBundle,
  onEquipClick,
  onUnequipClick
}) => {
  const { tokenOwner } = token?.collection?.permissions?.nesting || offer?.collectionDescription.permissions?.nesting || {};
  const { currentChainId } = useApi();
  const _collectionId = token?.collectionId || offer?.collectionId || 0;

  const canCustomize = token?.collection.properties.find(({ key }) => key === 'is_customizable')?.value;
  const canEquip = !!mockWearables[currentChainId || '']?.find(({ collectionId }) => collectionId === _collectionId);

  if (blockedNestingCollections[currentChainId || '']?.includes(_collectionId || 0)) return null;

  if (!(canCustomize || canEquip || isOwner || isNested)) return null;

  if (canCustomize || canEquip) {
    return <>
      <ActionsWrapper>
        <Heading size='4'>Customization</Heading>
        <CustomizableBlock
          token={token}
          offer={offer}
          collection={collection}
        />
        {isOwner && <ButtonsWrapper>
          {canEquip && !isNested && <Button
            className='equip-button'
            title={'Equip'}
            role='primary'
            onClick={onEquipClick}
            testid={`${testid}-transfer-button`}
            wide
          />}
          {canEquip && isNested && <Button
            className='equip-button'
            title={'Unequip'}
            onClick={onUnequipClick}
            testid={`${testid}-transfer-button`}
            wide
          />}
          {canCustomize && tokenOwner && <Button
            title={'Customize'}
            onClick={onCreateBundle}
            testid={`${testid}-transfer-button`}
          />}
        </ButtonsWrapper>}
      </ActionsWrapper>
      <Divider />
    </>;
    }

  return (
    <>
      <ActionsWrapper>
        <Heading size='4' >Nesting</Heading>
        <ButtonsWrapper>
          {isOwner && <Button
            title={'Nest this token'}
            onClick={onNestClick}
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
  h4.unique-font-heading.size-4 {
    margin-bottom: 0;
  }
`;

const Divider = styled.div`
  margin: calc(var(--gap) * 1.5) 0;
  border-top: 1px dashed ${Grey300};
`;

const ButtonsWrapper = styled.div`
  display: flex;
  gap: var(--gap);
  button.primary.equip-button {
    padding: 8px 128px;
  }
`;
