import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { Icon, Text } from '../index';
import { IconProps } from '@unique-nft/ui-kit';
import styled from 'styled-components';

export type NotificationSeverity = 'warning' | 'error' | 'info';

export type NotificationPlacement = 'right' | 'left';

export interface AlertProps {
  key?: string;
  severity: NotificationSeverity;
  content: ReactNode;
  state?: 'closed' | 'open';
  icon?: IconProps;
}

export interface NotificationsContextValueType {
  push(props: AlertProps): void;
  close(index: number): void;
  clearAll(): void;
}

export interface NotificationsProps {
  children: ReactNode;
  placement?: NotificationPlacement;
  closable?: boolean;
  closingDelay?: number;
  maxAlerts?: number;
}

const noop = () => {};

export const NotificationsContext =
  createContext<NotificationsContextValueType>({
    push: noop,
    close: noop,
    clearAll: noop
  });

export const Notifications = ({
                                children,
                                placement = 'right',
                                closable = true,
                                closingDelay = 5000,
                                maxAlerts = 5
                              }: NotificationsProps) => {
  const [alerts, setAlerts] = useState<AlertProps[]>([]);
  const alertKey = useRef(0);
  const timerId = useRef<NodeJS.Timer>();

  const clearingLoop = () => {
    timerId.current && clearInterval(timerId.current);
    timerId.current = setInterval(() => {
      setAlerts((alerts) => {
        if (!alerts.length) return alerts;
        return alerts
        .filter((alert) => alert.state !== 'closed')
        .map((alert, index) => ({
          ...alert,
          state: index === 0 ? 'closed' : alert.state
        }));
      });
    }, closingDelay);
  };

  const push = useCallback(
    (props: AlertProps) => {
      setAlerts((alerts) => [
        ...alerts
        .filter((item) => item.state !== 'closed')
        .slice(1 - maxAlerts),
        {
          key: `notification-alert-${(alertKey.current += 1)}`,
          ...props
        }
      ]);
      clearingLoop();
    },
    [setAlerts, maxAlerts]
  );

  const close = useCallback(
    (index: number) =>
      setAlerts((alerts) =>
        alerts.map((item, itemIndex) => ({
          ...item,
          state: itemIndex === index ? 'closed' : item.state
        }))
      ),
    [setAlerts]
  );

  const clearAll = useCallback(
    () =>
      setAlerts((alerts) =>
        alerts
        .filter((item) => item.state !== 'closed')
        .map((item) => ({ ...item, state: 'closed' }))
      ),
    [setAlerts]
  );

  const getDefaultIcon = (severity: NotificationSeverity): IconProps =>
    severity === 'info'
      ? { name: 'success', size: 32, color: '#fff' }
      : { name: 'warning', size: 32, color: '#fff' };

  useEffect(() => {
    return () => timerId.current && clearInterval(timerId.current);
  }, [closingDelay]);

  const value = useMemo(
    () => ({
      push,
      close,
      clearAll
    }),
    [push, close, clearAll]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <NotificationStyled className={classNames('notification-container', placement)}>
        {alerts.map(
          ({ content, state, severity, icon, key }, index) => (
            <div
              key={key}
              className={classNames('notification-alert', [
                severity,
                state
              ])}
              onClick={() => closable && close(index)}
            >
              <Icon {...(icon || getDefaultIcon(severity))} />
              <Text
                color='var(---color-additional-light)'
                size='m'
                weight='light'
              >
                {content}
              </Text>
            </div>
          )
        )}
      </NotificationStyled>
    </NotificationsContext.Provider>
  );
};

const NotificationStyled = styled.div`
  position: absolute;
  top: calc(80px + var(--prop-gap));
  right: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  z-index: 1100;
  overflow: hidden;

  .notification-alert {
    column-gap: 8px;
    align-items: center;
    display: flex;
    padding: 8px 16px;
    margin-bottom: 16px;
    border-radius: var(--prop-border-radius);
    max-height: 100%;
    max-width: 33vw;
    font-size: 16px;
    font-weight: 500;
    animation: slide-open-right 0.5s cubic-bezier(0.190, 1.000, 0.220, 1.000) both;
    overflow-y: hidden;
    svg {
      min-width: 32px;
    }
    &.info {
      background-color: var(--color-additional-positive-500);
      color: var(--color-additional-light);
    }
    &.warning {
      background-color: var(--color-additional-warning-500);
      color: var(--color-additional-light);
    }
    &.error {
      background-color: var(--color-coral-500);
      color: var(--color-additional-light);
    }
    &.closed {
      animation: slide-close-right 0.6s ease-in-out both;
    }
  }

  &.left {
    right: unset;
    left: 16px;
    align-items: flex-start;
    .notification-alert {
      animation: slide-open-left 0.5s cubic-bezier(0.190, 1.000, 0.220, 1.000) both;
      &.closed {
        animation: slide-close-left 0.6s ease-in-out both;
      }
    }
  }

  @keyframes slide-open-right {
    0% {
      transform: translateX(200%);
    }
    100% {
      transform: translateX(0px);
    }
  }

  @keyframes slide-close-right {
    0% {
      transform: translateX(0px);
    }
    80% {
      transform: translateX(200%);
      max-height: 100%;
      margin-bottom: 16px;
      padding: 8px 16px;
      height: initial;
    }
    100% {
      transform: translateX(200%);
      max-height: 0;
      margin-bottom: 0;
      padding: 0;
      height: 0;
    }
  }

  @keyframes slide-open-left {
    0% {
      transform: translateX(-200%);
    }
    100% {
      transform: translateX(0px);
    }
  }

  @keyframes slide-close-left {
    0% {
      transform: translateX(0px);
    }
    80% {
      transform: translateX(-200%);
      max-height: 100%;
      margin-bottom: 16px;
      padding: 8px 16px;
      height: initial;
    }
    100% {
      transform: translateX(-100%);
      max-height: 0;
      margin-bottom: 0;
      padding: 0;
      height: 0;
    }
  }
`;
