import { useContext } from 'react';
import NotificationContext, { NotificationContextProps } from '../notification/NotificationContext';

export function useNotification(): NotificationContextProps {
  return useContext(NotificationContext);
}
