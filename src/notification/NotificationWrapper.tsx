import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NotificationAlert, NotificationProvider } from './NotificationContext';
import Alerts from '../components/Alerts/Alerts';

const NOTIFICATION_DELAY = 2 * 1000;
const MAX_ALERTS = 5;

export type NotificationState = NotificationAlert & {
  isRemoved?: boolean
  key: string
}

const NotificationWrapper: FC = ({ children }) => {
  const [alerts, setAlerts] = useState<NotificationState[]>([]);
  const timerRef = useRef<NodeJS.Timer>();

  const removeOne = useCallback(() => {
    setAlerts((alerts) => {
      return alerts.reduce<NotificationState[]>((_alerts, alert) => {
        if (alert.isRemoved) return _alerts;
        if (_alerts.length === 0) {
          _alerts.push({ ...alert, isRemoved: true });
        } else {
          _alerts.push(alert);
        }

        return _alerts;
      }, []);
    });
  }, []);

  const push = useCallback((alert: NotificationAlert) => {
    setAlerts((alerts) => alerts.length > MAX_ALERTS
      ? [...alerts.filter((alert) => !alert.isRemoved).map((alert, index) => ({ ...alert, isRemoved: index === 0 })), {
        ...alert,
        key: `alert-${Date.now()}`
      }]
    : [...alerts, {
      ...alert,
      key: `alert-${Date.now()}`
    }]);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(removeOne, NOTIFICATION_DELAY);
  }, [alerts, removeOne]);

  const clear = useCallback(() => {
    setAlerts([]);
  }, []);

  const value = useMemo(() => ({
    push,
    clear
  }), [push, clear, alerts]);

  return (
    <NotificationProvider value={value}>
      {children}
      <Alerts alerts={alerts} />
    </NotificationProvider>
  );
};

export default NotificationWrapper;
