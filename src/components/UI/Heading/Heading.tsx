import { FC, PropsWithChildren } from 'react';
import classNames from 'classnames';
import './Heading.scss';

type IHeadingProps = PropsWithChildren<{
    size?: '1' | '2' | '3' | '4';
    className?: string;
    testid?: string;
}>;

export const Heading: FC<IHeadingProps> = ({
    children,
    size = '1',
    className,
    testid
}: IHeadingProps) => {
    const Component = `h${size}` as keyof JSX.IntrinsicElements;
    return (
      <Component
        className={classNames(
                'unique-font-heading',
                `size-${size}`,
                className
            )}
        data-testid={testid}
      >
        {children}
      </Component>
    );
};
