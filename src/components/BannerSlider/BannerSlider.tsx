import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { AdditionalLight, Grey400, Primary500 } from 'styles/colors';
import { Direction, Animation } from './types';

const PREVIOUS: Animation = 'previous';
const NEXT: Animation = 'next';

export const HORIZONTAL = 'horizontal';
export const VERTICAL = 'vertical';

const DEFAULT_CLASSNAMES = {
  previousButton: 'previousButton',
  nextButton: 'nextButton',
  buttonDisabled: 'disabled',
  track: 'track',
  slide: 'slide',
  hidden: 'hidden',
  previous: 'previous',
  current: 'current',
  next: 'next',
  animateIn: 'animateIn',
  animateOut: 'animateOut'
};

const DEFAULT_AUTOPLAY = 10_000;
const DEFAULT_DURATION = 500;

interface SliderProps {
  slideIndex?: number
  direction?: Direction
  autoplay?: number
  duration?: number
  disabled?: boolean
  infinite?: boolean
  className?: string
  minSwipeOffset?: number
}
const classNames = { ...DEFAULT_CLASSNAMES };

export const BannerSlider: FC<SliderProps> = ({
  slideIndex = 0,
  direction = Direction.Horizontal,
  autoplay = DEFAULT_AUTOPLAY,
  duration = DEFAULT_DURATION,
  disabled = false,
  infinite = true,
  className,
  children,
  minSwipeOffset = 15
 }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(slideIndex);
  const [targetSliderIndex, setTargetSliderIndex] = useState<number>(0);
  const [animation, setAnimation] = useState<Animation>();
  const [isMouseOver, setIsMouseOver] = useState<boolean>(false);

  const swipeProperty = direction === HORIZONTAL ? 'left' : 'top';
  const swipeEventProperty = direction === HORIZONTAL ? 'clientX' : 'clientY';

  const previousTargetIndex = useRef<number>(0);
  const animating = useRef<boolean>(false);
  const stop = useRef<() => void>();
  const autoplayTimerId = useRef<NodeJS.Timer>();
  const sliderRef = useRef<HTMLDivElement>(null);

  const slideCount = useMemo(() => {
    return React.Children.count(children);
  }, [children]);

  const isDisabled = useMemo(() => slideCount < 2 || disabled,
  [disabled, slideCount, animating]);

  const isInfinite = useMemo(() => slideCount >= 2 && !!infinite,
  [slideCount, infinite]);

  const canGoPrevious = useMemo(() => isInfinite || currentSlideIndex > 0,
  [isInfinite, currentSlideIndex]);

  const canGoNext = useMemo(() => isInfinite || currentSlideIndex < slideCount - 1,
  [isInfinite, currentSlideIndex, slideCount]);

  const previous = useCallback(() => {
    setTargetSliderIndex((index) => {
      previousTargetIndex.current = index;
      const prevIndex = index === 0 ? slideCount - 1 : index - 1;
      return prevIndex;
    });
  }, [slideCount]);

  const next = useCallback(() => {
    setTargetSliderIndex((index) => {
      previousTargetIndex.current = index;
      const nexIndex = index === slideCount - 1 ? 0 : index + 1;
      return nexIndex;
    });
  }, [slideCount]);

  const animationStop = (toIndex: number) => () => {
    setAnimation(undefined);
    setCurrentSlideIndex(toIndex);
    animating.current = false;
    stop.current = undefined;
  };

  useEffect(() => {
    if (autoplay && !isMouseOver) {
      autoplayTimerId.current = setInterval(
        next,
        autoplay
      );
    }

    return () => {
      if (autoplayTimerId.current) {
        clearInterval(autoplayTimerId.current);
      }
    };
  }, [autoplay, isMouseOver, next]);

  useEffect(() => {
    if (previousTargetIndex.current === targetSliderIndex) return;
    animating.current = true;
    if ((targetSliderIndex > previousTargetIndex.current && !(targetSliderIndex === slideCount - 1 && previousTargetIndex.current === 0)) || (targetSliderIndex === 0 &&
      previousTargetIndex.current === slideCount - 1)) {
      setAnimation(NEXT);
    } else {
      setAnimation(PREVIOUS);
    }
    const index = targetSliderIndex;
    stop.current = animationStop(index);
    const animationTimerId = setTimeout(stop.current, duration);

    return () => {
      if (!animating.current) return;

      stop.current?.();
      clearTimeout(animationTimerId);
    };
  }, [duration, targetSliderIndex]);

  const getSlideClass = useCallback((index: number) => {
    const lastSlideIndex = slideCount - 1;
    if (index === currentSlideIndex) {
      if (animation) return `${classNames.animateOut} ${classNames[animation]}`;
      return classNames.current;
    }
    if (slideCount === 2) {
      if (animation) {
        const position = animation === NEXT ? classNames.next : classNames.previous;
        return `${position} ${classNames.animateIn} ${classNames[animation]}`;
      }
      return index < currentSlideIndex ? classNames.next : classNames.previous;
    }
    if (
      index === currentSlideIndex - 1 ||
      (currentSlideIndex === 0 && index === lastSlideIndex)
    ) {
      if (animation === PREVIOUS) return `${classNames.animateIn} ${classNames.previous}`;
      if (animation === NEXT) return classNames.hidden;
      return classNames.previous;
    }
    if (
      index === currentSlideIndex + 1 ||
      (index === 0 && currentSlideIndex === lastSlideIndex)
    ) {
      if (animation === NEXT) return `${classNames.animateIn} ${classNames.next}`;
      if (animation === PREVIOUS) return classNames.hidden;
      return classNames.next;
    }
    return classNames.hidden;
  }, [slideCount, currentSlideIndex, animation]);

  useEffect(() => {
    if (!sliderRef.current) return;
    const { current, previous: previousClass, next: nextClass } = classNames;

    const handleMouseOver = () => {
      setIsMouseOver(true);
    };

    const handleMouseOut = () => {
      setIsMouseOver(false);
    };

    let currentElementStartPosition = 0;
    let currentElementPosition = 0;
    let previousElementStartPosition = 0;
    let nextElementStartPosition = 0;
    let pageStartPosition = 0;
    let currentElement: HTMLDivElement;
    let previousElement: HTMLDivElement;
    let nextElement: HTMLDivElement;
    let isSwiping = false;

    const handleTouchEnd = () => {
      if (!sliderRef.current) return;
      setIsMouseOver(false);
      animating.current = false;
      isSwiping = false;
      currentElement?.style.removeProperty(swipeProperty);
      currentElement?.style.removeProperty('transition');
      if (previousElement) {
        previousElement.style.removeProperty('visibility');
        previousElement.style.removeProperty('transition');
        previousElement.style.removeProperty(swipeProperty);
      }
      if (nextElement) {
        nextElement.style.removeProperty('visibility');
        nextElement.style.removeProperty('transition');
        nextElement.style.removeProperty(swipeProperty);
      }
      const touchDelta = currentElementStartPosition - currentElementPosition;
      if (Math.abs(touchDelta) > minSwipeOffset) {
        if (touchDelta < 0) {
          previous();
        } else {
          next();
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!sliderRef.current) return;
      setIsMouseOver(true);
      animating.current = true;
      const touch = e.touches[0];
      isSwiping = true;

      pageStartPosition = touch[swipeEventProperty];
      currentElement = sliderRef.current.getElementsByClassName(current)[0] as HTMLDivElement;
      previousElement = sliderRef.current.getElementsByClassName(previousClass)[0] as HTMLDivElement;
      nextElement = sliderRef.current.getElementsByClassName(nextClass)[0] as HTMLDivElement;

      const touchDelta = currentElement?.getBoundingClientRect()[swipeProperty];
      currentElementStartPosition = 0;
      currentElementPosition = 0;
      if (currentElement) {
        currentElement.style.transition = 'none';
      }
      if (previousElement) {
        previousElement.style.transition = 'none';
        previousElement.style.visibility = 'visible';
        previousElementStartPosition = previousElement.getBoundingClientRect()[swipeProperty] - touchDelta;
      }
      if (nextElement) {
        nextElement.style.visibility = 'visible';
        nextElement.style.transition = 'none';
        nextElementStartPosition = nextElement.getBoundingClientRect()[swipeProperty] - touchDelta;
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
        if (!sliderRef.current) return;
        if (animating.current) {
          requestAnimationFrame(() => {
            if (!isSwiping) {
              animating.current = false;
              return;
            }
            const touch = e.touches[0];
            const newLeft = touch[swipeEventProperty] - pageStartPosition;
            currentElementPosition = currentElementStartPosition + newLeft;
            if (currentElement) {
              currentElement.style[swipeProperty] = `${currentElementPosition}px`;
            }
            if (previousElement) {
              const previousElementPosition = previousElementStartPosition + newLeft;
              previousElement.style[swipeProperty] = `${previousElementPosition}px`;
            }
            if (nextElement) {
              const nextElementPosition = nextElementStartPosition + newLeft;
              nextElement.style[swipeProperty] = `${nextElementPosition}px`;
            }
          });
        }
      };

    sliderRef.current.addEventListener('mouseover', handleMouseOver);
    sliderRef.current.addEventListener('mouseleave', handleMouseOut);
    sliderRef.current.addEventListener('touchstart', handleTouchStart);
    sliderRef.current.addEventListener('touchmove', handleTouchMove, {
      passive: false
    });
    sliderRef.current.addEventListener('touchend', handleTouchEnd);

    return () => {
      sliderRef.current?.removeEventListener('mouseover', handleMouseOver);
      sliderRef.current?.removeEventListener('mouseleave', handleMouseOut);
      sliderRef.current?.removeEventListener('touchstart', handleTouchStart);
      sliderRef.current?.removeEventListener('touchmove', handleTouchMove);
      sliderRef.current?.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDisabled]);

  const nextClick = () => {
    if (animation) return;
    next();
  };

  const previousClick = () => {
    if (animation) return;
    previous();
  };

  return (<SliderWrapper>
    <SliderPaper
      className={className}
      ref={sliderRef}
    >
      {slideCount > 1 && <>
        <a
          onClick={previousClick}
          className={`${classNames.previousButton}${isDisabled || !canGoPrevious ? ` ${classNames.buttonDisabled}` : ''}`}
        >
          {previousButton}
        </a>
        <a
          onClick={nextClick}
          className={`${classNames.nextButton}${isDisabled || !canGoNext ? ` ${classNames.buttonDisabled}` : ''}`}
        >
          {nextButton}
        </a>
      </>}
      <Track>
        {React.Children.map(children, (item, index) => (
          React.isValidElement<{ className: string }>(item) && React.cloneElement(item, {
            key: index,
            className: [
              classNames.slide,
              getSlideClass(index),
              item.props.className
            ].filter((v) => v).join(' ')
          })
        ))}
      </Track>
    </SliderPaper>
    <Bullets>
      {Array.from({ length: slideCount }).map((_, index) => <Bullet
        key={index}
        isCurrent={index === targetSliderIndex}
      />)}
    </Bullets>
  </SliderWrapper>);
};

const SliderWrapper = styled.div` 
  display: flex;
  flex-direction: column;
`;

const Bullets = styled.div` 
  display: flex;
  gap: calc(var(--gap) / 2);
  height: 8px;
  margin: calc(var(--gap) * 2) 0;
  align-self: center;
`;

const Bullet = styled.div<{ isCurrent: boolean }>` 
  width: ${({ isCurrent }) => isCurrent ? '32px' : '8px'};
  height: 8px;
  border-radius: 4px;
  background-color: ${({ isCurrent }) => isCurrent ? Primary500 : Grey400};
  transition: all .3s linear;
`;

const SliderPaper = styled.div`
  position: relative;
  
  height: calc(37.5vw);
  overflow: hidden;
  background: ${AdditionalLight};
  box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
  border-radius: 4px;
  & a {
    &.previousButton, &.nextButton {
      font-size: 22px;
      line-height: 0;
      display: block;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      transition: all .3s linear;
      z-index: 1;
      color: #333;
      padding: 10px;
      text-decoration: none;
      backface-visibility: hidden; /* prevent jump effect when scaling */

      &:not(.disabled):hover {
        transform: translateY(-50%) scale(1.25);
        cursor: pointer;
      }
    }

    &.previousButton {
      left: 20px;

      @media (max-width: 1024px) {
        left: 0px;
      }
      @media (max-width: 768px) {
        display: none;
      }
    }

    &.nextButton {
      right: 20px;

      @media (max-width: 1024px) {
        right: 0px;
      }
      @media (max-width: 768px) {
        display: none;
      }
    }
  }
  .slide {
    position: absolute;
    overflow: hidden;

    &.hidden {
      visibility: hidden;
    }

    &.previous {
      left: -100%;
    }

    &.current {
      left: 0;
    }

    &.next {
      left: 100%;
    }

    &.animateIn,
    &.animateOut {
      transition: all 0.5s ease;
    }

    &.animateIn {
      &.previous,
      &.next {
        left: 0;
        visibility: visible;
      }
    }

    &.animateOut {
      &.previous {
        left: 100%;
      }

      &.next {
        left: -100%;
      }
    }
  }

  @media (min-width: 1920px) {
    height: calc(548px);
  }
  @media (max-width: 1024px) {
    background: ${AdditionalLight};
    box-shadow: none;
    margin: 0 -24px;
    width: 100vw;
  }
  @media (max-width: 768px) {
    height: calc(75vw + 232px);
  }
  @media (max-width: 620px) {
    margin: 0 -16px;
  }
`;

const Track = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  
`;

type ArrowTransforms = 'up' | 'down'
 | 'left' | 'right';
const arrowTransforms: Record<ArrowTransforms, string> = {
  up: 'rotate(90 20 20)',
  down: 'rotate(270 20 20)',
  left: 'rotate(180 20 20)',
  right: 'rotate(0 20 20)'
};

const Arrow = ({ direction = 'right' }: { direction: ArrowTransforms }) => {
  return (
    <svg width='40'
      height='40'
      viewBox='0 0 40 40'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path transform={arrowTransforms[direction]}
        fillRule='evenodd'
        clipRule='evenodd'
        d='M14.1161 6.61612C14.6043 6.12796 15.3957 6.12796 15.8839 6.61612L28.3839 19.1161C28.872 19.6043 28.872 20.3957 28.3839 20.8839L15.8839 33.3839C15.3957 33.872 14.6043 33.872 14.1161 33.3839C13.628 32.8957 13.628 32.1043 14.1161 31.6161L25.7322 20L14.1161 8.38388C13.628 7.89573 13.628 7.10427 14.1161 6.61612Z'
        fill='#091941'
      />
    </svg>
  );
};

const previousButton = <Arrow direction={'left'} />;
const nextButton = <Arrow direction={'right'} />;
