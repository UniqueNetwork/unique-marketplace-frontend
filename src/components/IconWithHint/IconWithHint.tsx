import React, { FC, useCallback, useState } from 'react';
import questionFilledIcon from 'static/icons/question-fill.svg';
import questionIcon from 'static/icons/question.svg';
import styled from 'styled-components';
import { Tooltip } from '@unique-nft/ui-kit';

interface IProps {
  offset?: number;
  placement?: 'left' | 'right' | 'bottom' | 'top' | 'left-start' | 'left-end' | 'right-start' | 'right-end' | 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
}

const IconWithHint: FC<IProps> = ({ placement = 'bottom', offset = 5, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const onHover = useCallback(
    () => {
      setIsHovered(true);
    },
    []
  );
  const onHoverEnd = useCallback(
    () => {
      setIsHovered(false);
    },
    []
  );
  return (
    <Cell>
      <IconContainer
        onMouseOver={onHover}
        onMouseOut={onHoverEnd}
      >
        <Tooltip
          content={<img alt='questionIcon' src={isHovered ? questionFilledIcon : questionIcon}/>}
          placement={placement}
          offset={offset}
        >
          {children}
        </Tooltip>
      </IconContainer>
    </Cell>
  );
};

const Cell = styled.div`
  display: flex;
  align-items: center;
`;

const IconContainer = styled.div`
  position: relative;
  img { cursor: pointer; }
`;

export default IconWithHint;
