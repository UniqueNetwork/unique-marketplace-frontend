import { ForwardedRef, forwardRef, ReactNode } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';
import { ComponentProps } from '../types';
import './Text.scss';

export interface ITextBaseProps {
  children: ReactNode;
  size?: 'xs' | 's' | 'm' | 'l';
  weight?: 'light' | 'regular' | 'bold';
  color?: string;
  appearance?: 'inline' | 'block';
  title?: string;
}

export type TextProps = ITextBaseProps &
  Pick<ComponentProps, 'className' | 'id' | 'testid'>;

export const Text = forwardRef(({
  children,
  size = 'm',
  weight = 'regular',
  color = 'secondary-500',
  className,
  appearance = 'inline',
  testid,
  ...rest
}: TextProps, ref: ForwardedRef<any>) => {
  return (
    <TextStyled
      className={classNames(
        'unique-text',
        `size-${size}`,
        `weight-${weight}`,
        `color-${color}`,
        `appearance-${appearance}`,
        className
      )}
      data-testid={testid}
      ref={ref}
      {...rest}
    >
      {children}
    </TextStyled>
  );
});

const TextStyled = styled.span`
  
`;
