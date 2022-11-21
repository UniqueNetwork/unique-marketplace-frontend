import { Icon } from '../Icon/Icon';
import React, { useCallback, useRef, useState, MouseEvent } from 'react';
import styled from 'styled-components';

interface CopyButtonProps {
  size?: number
  testid?: string
  onClick?(event: MouseEvent): void
}

export const CopyButton = ({ size = 16, testid, onClick }: CopyButtonProps) => {
  const [isClicked, setClicked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const onIconClick = useCallback((event: MouseEvent) => {
    setClicked(true);
    onClick?.(event);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    timerRef.current = setTimeout(() => setClicked(false), 1000);
  }, [setClicked, onClick]);

  return <StyledIcon
    size={size}
    name={isClicked ? 'check-circle' : 'copy'}
    className={isClicked ? 'clicked' : ''}
    onClick={onIconClick}
    testid={testid}
  />;
};

const StyledIcon = styled(Icon)`
  cursor: pointer;
  min-width: ${({ size }) => `${size}px`};
  &:hover {
    fill: var(--color-primary-500);
  }
  &.clicked {
    fill: var(--color-additional-positive-500);
  }
`;
