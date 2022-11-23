<<<<<<< HEAD
import { ForwardedRef, forwardRef, ReactNode } from 'react';
=======
import { forwardRef, ReactNode } from 'react';
>>>>>>> f98f213e (Update collection page layout)
import classNames from 'classnames';
import { ComponentProps } from '@unique-nft/ui-kit';
import styled from 'styled-components';

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

<<<<<<< HEAD
export const Text = forwardRef(({
=======
export const Text = forwardRef<HTMLSpanElement, TextProps>(({
>>>>>>> f98f213e (Update collection page layout)
  children,
  size = 'm',
  weight = 'regular',
  color = 'secondary-500',
  className,
  appearance = 'inline',
  testid,
  ...rest
<<<<<<< HEAD
}: TextProps, ref: ForwardedRef<any>) => {
=======
}: TextProps, ref) => {
>>>>>>> f98f213e (Update collection page layout)
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
  @each $color, $value in $base-colors-map {
    &[class*='#{$color}'] {
      color: $value;
    }
  }
  @each $size in xs, s, m, l {
    &[class*='size-#{$size}'] {
    @include font-body($size);
    }
  }
  @each $weight in light, regular, bold {
    &[class*='weight-#{$weight}'] {
    @include font-weight($weight);
    }
  }
  @each $appearance in inline, block {
    &[class*='appearance-#{$appearance}'] {
      display: $appearance;
    }
  }
`;
