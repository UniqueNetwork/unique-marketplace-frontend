import React, { FC } from 'react';
import styled from 'styled-components';
import { Button, Heading } from 'components/UI';

import { Grey300 } from 'styles/colors';
import { CollectionWithInfoV2Dto, TokenWithInfoV2Dto } from '@unique-nft/sdk';
import { blockedNestingCollections } from '../SellToken/constants';
import { useApi } from 'hooks/useApi';
import { mockWearables } from '../constants';
import { CustomizableBlock } from './CustomizableBlock';
import { Offer } from 'api/restApi/offers/types';

interface NestingTokenBlockProps {
  token?: TokenWithInfoV2Dto
  collection?: CollectionWithInfoV2Dto | undefined
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
  const { tokenOwner } = collection?.permissions?.nesting || offer?.collectionDescription.permissions?.nesting || {};
  const { currentChainId } = useApi();
  const _collectionId = token?.collectionId || offer?.collectionId || 0;
  const canTransfer = collection?.limits?.transfersEnabled !== false;

  const canCustomize = collection?.properties.find(({ key }) => key === 'is_customizable')?.value;
  const canEquip = !!mockWearables[currentChainId || '']?.find(({ collectionId }) => collectionId === _collectionId);

  if (blockedNestingCollections[currentChainId || '']?.includes(_collectionId || 0)) return null;

  if (!(canCustomize || canEquip || isOwner || isNested) || !canTransfer) return null;

  if (canCustomize || canEquip) {
    return <>
      <ActionsWrapper>
        <Heading size='4'>Customization details</Heading>
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
            className='customize-button'
            title={'Customize'}
            onClick={onCreateBundle}
            role='primary'
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
  row-gap: var(--prop-gap);
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  h4.unique-font-heading.size-4 {
    margin-bottom: 0;
  }
`;

const Divider = styled.div`
  margin: calc(var(--prop-gap) * 1.5) 0;
  border-top: 1px dashed ${Grey300};
`;

const ButtonsWrapper = styled.div`
  display: flex;
  gap: var(--prop-gap);
  button.primary.equip-button {
    padding: 8px 128px;
  }
  button.primary.customize-button {
    padding: 8px 64px;
  }
`;
