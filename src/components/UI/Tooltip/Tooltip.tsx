import React, { FC, ReactNode, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import classNames from 'classnames';

export type VerticalAlign = 'top' | 'middle' | 'bottom';
export type HorizontalAlign = 'left' | 'middle' | 'right';
export type AppearanceAlign = 'vertical' | 'horizontal';

export type TooltipAlign = {
  vertical: VerticalAlign;
  horizontal: HorizontalAlign;
  appearance: AppearanceAlign;
};

interface TooltipProps {
  align?: TooltipAlign;
  targetRef: React.RefObject<HTMLElement>;
  children: ReactNode;
  className?: string;
}

const TooltipWrapper = styled.div<{ $isVisible: boolean; $appearance: AppearanceAlign }>`
  font-family: var(--prop-font-family);
  font-size: var(--prop-font-size);
  font-weight: var(--prop-font-weight);
  position: fixed;
  padding: 8px 15px;
  max-width: 350px;
  width: fit-content;
  background-color: var(--color-secondary-500);
  color: var(--color-additional-light);
  border-radius: 2px;
  z-index: 1000;
  line-height: 22px;
  display: inline-flex;
  opacity: ${props => props.$isVisible ? 1 : 0};
  visibility: ${props => props.$isVisible ? 'visible' : 'hidden'};
  transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
  pointer-events: ${props => props.$isVisible ? 'auto' : 'none'};

  &:before {
    position: absolute;
    content: '';
    left: -15px;
    top: -15px;
    width: calc(100% + 30px);
    height: calc(100% + 30px);
  }

  .content {
    z-index: 101;
  }

  .arrow {
    position: absolute;

    .icon {
      width: 8px;
      height: 8px;
      transform: rotate(45deg);
      background-color: var(--color-secondary-500);
    }

    &.vertical {
      &.top {
        top: -4px;
      }

      &.bottom {
        bottom: -4px;
      }

      &.left {
        left: 10px;
      }

      &.middle {
        left: calc(50% - 4px);
      }

      &.right {
        right: 10px;
      }
    }

    &.horizontal {
      &.left {
        left: -4px;
      }

      &.right {
        right: -4px;
      }

      &.middle {
        top: calc(50% - 4px);
      }

      &.top {
        top: 11px;
      }

      &.bottom {
        bottom: 11px;
      }
    }
  }
`;

export const Tooltip: FC<TooltipProps> = ({ align, targetRef, children, className }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipStyles, setTooltipStyles] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const [isHovered, setIsHovered] = useState(false);
  const [arrow, setArrow] = useState({ x: 'right', y: 'bottom' });

  const updateTooltipPosition = () => {
    if (!tooltipRef.current || !targetRef.current) return;

    const { top, height, left, width } = targetRef.current.getBoundingClientRect();
    let leftPos = 0;
    let topPos = 0;
    const arrowPos = { x: 'right', y: 'bottom' };

    const {
      vertical = 'bottom',
      horizontal = 'right',
      appearance = 'vertical'
    } = align || {};

    if (appearance === 'horizontal') {
      if (vertical === 'top') {
        topPos = top - 5;
        arrowPos.y = 'top';
      } else if (vertical === 'middle') {
        topPos = top + (height - tooltipRef.current.clientHeight) / 2;
        arrowPos.y = 'middle';
      } else if (vertical === 'bottom') {
        topPos = top + height - tooltipRef.current.clientHeight + 5;
        arrowPos.y = 'bottom';
      }

      if (horizontal === 'left') {
        leftPos = left - tooltipRef.current.clientWidth - 10;
        arrowPos.x = 'right';
      } else if (horizontal === 'right') {
        leftPos = left + width + 10;
        arrowPos.x = 'left';
      }
    } else {
      if (vertical === 'top') {
        topPos = top - tooltipRef.current.clientHeight - 5;
        arrowPos.y = 'bottom';
      } else if (vertical === 'middle') {
        topPos = top + (height - tooltipRef.current.clientHeight) / 2;
        arrowPos.y = 'middle';
      } else if (vertical === 'bottom') {
        topPos = top + height + 5;
        arrowPos.y = 'top';
      }

      if (horizontal === 'left') {
        leftPos = left - 10;
        arrowPos.x = 'left';
      } else if (horizontal === 'right') {
        leftPos = left + width - tooltipRef.current.clientWidth + 10;
        if (leftPos < 0) {
          leftPos = 4;
        }
        arrowPos.x = 'right';
      } else if (horizontal === 'middle') {
        leftPos = left + (width - tooltipRef.current.clientWidth) / 2;
        arrowPos.x = 'middle';
      }
    }

    setTooltipStyles({ top: topPos, left: leftPos });
    setArrow(arrowPos);
  };

  useEffect(() => {
    if (isHovered) {
      updateTooltipPosition();
    }
  }, [isHovered, targetRef, align]);

  useEffect(() => {
    const targetElement = targetRef.current;
    if (!targetElement) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    targetElement.addEventListener('mouseenter', handleMouseEnter);
    targetElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      targetElement.removeEventListener('mouseenter', handleMouseEnter);
      targetElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [targetRef]);

  return (
    <TooltipWrapper
      ref={tooltipRef}
      className={classNames('unique-tooltip', className)}
      style={tooltipStyles}
      $isVisible={isHovered}
      $appearance={align?.appearance || 'vertical'}
    >
      <div
        className={classNames('arrow', align?.appearance, {
          [arrow.x]: !!arrow.x,
          [arrow.y]: !!arrow.y
        })}
      >
        <div className="icon" />
      </div>
      <div className="content">{children}</div>
    </TooltipWrapper>
  );
};

