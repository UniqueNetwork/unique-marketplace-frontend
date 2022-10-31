import React, { FC, useCallback, useRef, useState } from 'react';
import questionFilledIcon from 'static/icons/question-fill.svg';
import questionIcon from 'static/icons/question.svg';
import styled from 'styled-components';
import { Tooltip, TooltipAlign } from '@unique-nft/ui-kit';

interface IProps {
  align?: TooltipAlign;
  testid?: string
}

const IconWithHint: FC<IProps> = ({ align, children, testid }) => {
  const [isHovered, setIsHovered] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);
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
        data-testid={`${testid}-tooltip`}
      >
        <Tooltip
          align={align}
          targetRef={targetRef}
        >
          {children}
        </Tooltip>
        <div ref={targetRef}>
          <img alt='questionIcon' src={isHovered ? questionFilledIcon : questionIcon}/>
        </div>
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
