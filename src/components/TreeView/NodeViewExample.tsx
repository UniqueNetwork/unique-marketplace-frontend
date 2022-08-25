import React, { FC } from 'react';
import { Icon } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { INodeView } from './types';
import { Grey300, Primary500 } from '../../styles/colors';
import { Picture } from '../Picture';

const NodeView: FC<INodeView> = ({ arrowClicked, isOpened, data, textClicked, isFirst, level, children }) => {
  return (
    <>
      <ViewContainer isFirst={isFirst}>
        <Arrow
          isFirst={isFirst}
          level={level}
          onClick={arrowClicked}
          isOpened={isOpened}
        >
          <Icon size={16} name={data.nestingChildTokens?.length ? 'triangle' : ''} color={Primary500} />
        </Arrow>
        <Picture alt={`T-#${data.tokenId} C-#${data.collectionId}`} src={data.image.fullUrl || undefined}/>
        <Name onClick={textClicked} isSelected={!!data.selected}>T-#{data.tokenId} C-#{data.collectionId}</Name>
        <hr/>
      </ViewContainer>
      {children}
    </>
  );
};

const ViewContainer = styled.div<{ isFirst: boolean | undefined }>`
  //height: 58px;
  hr {
    border-top: 1px dashed ${Grey300};
    border-left: none;
  }
  .picture {
    display: inline-block;
    width: 40px;
    height: 40px;
    img {
      border-radius: 4px;
      width: 100%;
      height: 100%;
      object-fit: fill;
    }
  }
`;

const Arrow = styled.div<{ isOpened: boolean | undefined, isFirst: boolean | undefined, level: number }>`
  cursor: pointer;
  margin-right: 6px;
  display: inline-block;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  transform: ${({ isOpened }) => (!isOpened && 'rotate(-90deg)')};
  margin-left: ${({ isFirst, level }) => (isFirst ? 24 : 24 + 16 * level)}px;
`;

const Name = styled.p<{ isSelected: boolean }>`
  cursor: pointer;
  display: inline-block;

  background-color: ${({ isSelected }) => (isSelected && '#e8efff')};
  box-shadow: ${({ isSelected }) => (isSelected && '0 0 2px #0a6aa1')};
  
  &:hover {
    background-color: #e8eff7;
    box-shadow: 0 0 2px #0a6aa1;
  }
`;

export default NodeView;
