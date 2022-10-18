import { NotificationsContext } from '../Notifications';
import { ReactNode, useContext, useMemo } from 'react';
import { IconProps } from '@unique-nft/ui-kit';

export const useNotifications = () => {
  const { push, clearAll } = useContext(NotificationsContext);

  return useMemo(
    () => ({
      info: (content: ReactNode, icon?: IconProps) =>
        push({ content, severity: 'info', icon }),
      warning: (content: ReactNode, icon?: IconProps) =>
        push({ content, severity: 'warning', icon }),
      error: (content: ReactNode, icon?: IconProps) =>
        push({ content, severity: 'error', icon }),
      clearAll
    }),
    [push, clearAll]
  );
};
