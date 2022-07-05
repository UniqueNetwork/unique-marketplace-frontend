import React, { Ref, useCallback } from 'react';
import styled from 'styled-components/macro';

type NetworkLink<LinkOptions> = (url: string, options: LinkOptions) => string;

type WindowPosition = 'windowCenter' | 'screenCenter';

const getBoxPositionOnWindowCenter = (width: number, height: number) => ({
  left: window.outerWidth / 2 + (window.screenX || window.screenLeft || 0) - width / 2,
  top: window.outerHeight / 2 + (window.screenY || window.screenTop || 0) - height / 2
});

const getBoxPositionOnScreenCenter = (width: number, height: number) => ({
  top: (window.screen.height - height) / 2,
  left: (window.screen.width - width) / 2
});

function windowOpen(
  url: string,
  { height, width, ...configRest }: { height: number; width: number; }
) {
  const config: { [key: string]: string | number } = {
    height,
    width,
    location: 'no',
    toolbar: 'no',
    status: 'no',
    directories: 'no',
    menubar: 'no',
    scrollbars: 'yes',
    resizable: 'no',
    centerscreen: 'yes',
    chrome: 'yes',
    ...configRest
  };

  return window.open(
    url,
    '',
    Object.keys(config)
      .map((key) => `${key}=${config[key]}`)
      .join(', ')
  );
}

interface CustomProps<LinkOptions> {
  children?: React.ReactNode;
  /** Disables click action and adds `disabled` class */
  disabled?: boolean;
  /**
   * Style when button is disabled
   * @default { opacity: 0.6 }
   */
  disabledStyle?: React.CSSProperties;
  forwardedRef?: Ref<HTMLButtonElement>;
  networkLink: NetworkLink<LinkOptions>;
  openShareDialogOnClick?: boolean;
  opts: LinkOptions;
  /** URL of the shared page */
  url: string;
  style?: React.CSSProperties;
  windowWidth?: number;
  windowHeight?: number;
  windowPosition?: WindowPosition;
}

export type Props<LinkOptions> = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  keyof CustomProps<LinkOptions>
  > &
  CustomProps<LinkOptions>;

export default function ShareButton<LinkOptions>(props: CustomProps<LinkOptions>) {
  const {
    disabledStyle = { opacity: 0.6 },
    openShareDialogOnClick = true,
    windowHeight = 400,
    windowPosition = 'windowCenter',
    windowWidth = 550,
    disabled,
    networkLink,
    url,
    opts,
    children,
    forwardedRef,
    style,
    ...rest
  } = props;

  const openShareDialog = useCallback((link: string) => {
    const windowConfig = {
      height: windowHeight,
      width: windowWidth,
      ...(windowPosition === 'windowCenter'
        ? getBoxPositionOnWindowCenter(windowWidth, windowHeight)
        : getBoxPositionOnScreenCenter(windowWidth, windowHeight))
    };
    windowOpen(link, windowConfig);
  }, [windowHeight, windowWidth, windowPosition]);

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const link = networkLink(url, opts);
    if (disabled) {
      return;
    }
    event.preventDefault();
    if (openShareDialogOnClick) {
      openShareDialog(link);
    }
  }, [disabled, networkLink, openShareDialog, url, opts, openShareDialogOnClick]);

    return (
      <StyledButton
        {...rest}
        onClick={handleClick}
        ref={forwardedRef}
        style={{ ...style, ...(disabled && disabledStyle) }}
      >
        {children}
      </StyledButton>
    );
}

const StyledButton = styled.button`
  background-color: transparent;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
`;
