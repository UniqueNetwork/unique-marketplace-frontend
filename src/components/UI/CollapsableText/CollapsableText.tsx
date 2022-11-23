import { Text, TextProps } from '../Text/Text';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Link } from '../Link/Link';

interface CollapsableTextProps extends TextProps {
  isCollapsed?: boolean;
  children: string | undefined
}

export const CollapsableText = (props: CollapsableTextProps) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(props.isCollapsed || true);
  const [isCollapsable, setIsCollapsable] = useState<boolean>(false);
  const textRef = useRef<HTMLSpanElement>(null);
  const toggleCollapsed = () => setIsCollapsed(!isCollapsed);

  useEffect(() => {
    if (!textRef.current) return;

    const lineHeight = parseInt(window.getComputedStyle(textRef.current).lineHeight);

    setIsCollapsable(textRef.current.offsetHeight > lineHeight);

    console.log(textRef.current.offsetHeight);
  }, [props.children]);

  return <CollapsableTextWrapper isCollapsed={isCollapsable && isCollapsed}>
    <span>
      <Text ref={textRef} {...props}>{props.children}</Text>
      {isCollapsable && isCollapsed && '...'}
    </span>
    {isCollapsable && <Link onClick={toggleCollapsed} >{isCollapsed ? 'Show more' : 'Show less'}</Link>}
  </CollapsableTextWrapper>;
};

const CollapsableTextWrapper = styled.div<{ isCollapsed: boolean }>`
  display: ${({ isCollapsed }) => isCollapsed ? 'flex' : 'unset'};
  width: 976px;
  overflow: hidden;

  @media (max-width: 1560px) {
    width: 776px;
  }
  @media (max-width: 1320px) {
    width: 576px;
  }
  @media (max-width: 1024px) {
    width: 576px;
  }
  @media (max-width: 768px) {
    width: 576px;
  }
  
  & > span {
    white-space: ${({ isCollapsed }) => isCollapsed ? 'nowrap' : 'unset'};;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  & > a {
    font-weight: 400;
    font-size: 18px;
    line-height: 28px;
    margin-left: calc(var(--gap) / 2);
    color: var(--color-primary-500);
    cursor: pointer;
    white-space: nowrap;
  }
`;
