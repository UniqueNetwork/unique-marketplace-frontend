import React, { FC, useCallback, useState } from 'react';
import questionFilledIcon from 'static/icons/question-fill.svg';
import questionIcon from 'static/icons/question.svg';
import styled from 'styled-components';
import { AdditionalDark, AdditionalLight } from 'styles/colors';

interface IProps {
  width?: number
  position?: 'top' | 'bottom';
}

const IconWithHint: FC<IProps> = ({ width = 120, position = 'bottom', children }) => {
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
    <Container
      onMouseOver={onHover}
      onMouseLeave={onHoverEnd}
    >
      <img
        alt='questionIcon'
        src={isHovered ? questionFilledIcon : questionIcon}
      />
      {isHovered &&
        <TooltipStyled width={width} className={position}>
          {children}
        </TooltipStyled>}
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  img { cursor: pointer; }
  
  .top {
    left: -210px;
    top: -40px;
    
    ::before {
      left: 217px;
      top: 37px;
      border-left: 5px solid transparent;
      border-top: 9px solid var(--color-additional-dark);
      border-right: 5px solid transparent;
    }
  }

  .bottom {
    left: -126px;
    top: 25px;
    
    ::before {
      left: 133px;
      top: -7px;
      border-left: 5px solid transparent;
      border-bottom: 9px solid var(--color-additional-dark);
      border-right: 5px solid transparent;
    }
  }
`;

const TooltipStyled = styled.div<{ width: number }>`
  position: absolute;
  background: ${AdditionalDark};
  width: ${(props) => (props.width)}px;
  color: ${AdditionalLight};
  z-index: 1;
  padding: 8px 16px !important;
  line-height: 22px;
  border-radius: 2px;

  ::before {
    position: absolute;
    content: "";
    width: 0;
    height: 0;
  }

  a {
    color: ${AdditionalLight};
    text-decoration: underline;
  }

  a:hover {
    text-decoration: none;
  }
`;

export default IconWithHint;
