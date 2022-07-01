import React, { useCallback, useState } from 'react';
import questionFilledIcon from 'static/icons/question-fill.svg';
import questionIcon from 'static/icons/question.svg';
import styled from 'styled-components';
import { AdditionalDark, AdditionalLight } from 'styles/colors';

const IconWithHint = () => {
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
        <TooltipStyled>
          Learn more in <a href='/faq' target='_blank' rel='noreferrer'>FAQ</a>
        </TooltipStyled>}
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  img { cursor: pointer; }
`;

const TooltipStyled = styled.div`
  position: absolute;
  background: ${AdditionalDark};
  width: 120px;
  color: ${AdditionalLight};
  z-index: 1;
  left: -126px;
  top: 25px;
  padding: 8px 16px !important;
  line-height: 22px;
  border-radius: 2px;

  ::before {
    position: absolute;
    content: "";
    width: 0;
    height: 0;
    left: 133px;
    top: -7px;
    border-left: 5px solid transparent;
    border-bottom: 9px solid var(--color-additional-dark);
    border-right: 5px solid transparent;
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
