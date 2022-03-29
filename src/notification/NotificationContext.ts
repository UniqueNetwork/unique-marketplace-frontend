import { Consumer, Context, createContext, Provider, ReactNode } from 'react';

export enum NotificationSeverity {
  success = 'success',
  warning = 'warning',
  error = 'error'
}
export interface NotificationAlert {
  message: string | ReactNode
  severity: NotificationSeverity
}

export type NotificationContextProps = {
  push(alert: NotificationAlert): void
  clear(): void
}

const NotificationContext: Context<NotificationContextProps> = createContext({} as unknown as NotificationContextProps);
const NotificationConsumer: Consumer<NotificationContextProps> = NotificationContext.Consumer;
const NotificationProvider: Provider<NotificationContextProps> = NotificationContext.Provider;

export default NotificationContext;

export { NotificationConsumer, NotificationProvider };
