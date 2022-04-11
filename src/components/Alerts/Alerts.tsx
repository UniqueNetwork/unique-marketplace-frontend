import React, { FC } from 'react';
import styled from 'styled-components/macro';
import { Icon } from '@unique-nft/ui-kit';

import { NotificationSeverity } from '../../notification/NotificationContext';
import { AdditionalLight, AdditionalPositive500, Coral500 } from '../../styles/colors';
import CheckCircle from '../../static/icons/check-circle-light.svg';
import Warning from '../../static/icons/warning.svg';
import { NotificationState } from '../../notification/NotificationWrapper';

interface AlertsProps {
  alerts: NotificationState[]
}

const Alerts: FC<AlertsProps> = ({ alerts }) => {
  return (
    <AlertsWrapper>
      {alerts.map((alert) => <Alert
        key={alert.key}
        severity={alert.severity}
        isRemoved={alert.isRemoved}
      >
        <Icon size={32} file={alert.severity === NotificationSeverity.success ? CheckCircle : Warning} />
        {alert.message}
      </Alert>)}
    </AlertsWrapper>
  );
};

const AlertsWrapper = styled.div`
  position: absolute;
  top: calc(80px + var(--gap));
  right: var(--gap);
  display: flex;
  flex-direction: column;
  z-index: 1100;
`;

const Alert = styled.div<{ severity: NotificationSeverity, isRemoved?: boolean }>`
  background-color: ${({ severity }) => severity === NotificationSeverity.success ? AdditionalPositive500 : Coral500};
  column-gap: calc(var(--gap) / 2);
  align-items: center;
  display: flex;
  transition: opacity 100ms, min-height 100ms 500ms, padding 100ms 500ms, margin-bottom 100ms 500ms;
  opacity: ${({ isRemoved }) => isRemoved ? '0' : '1'};
  min-height: ${({ isRemoved }) => isRemoved ? '0px' : '32px'};
  padding: ${({ isRemoved }) => isRemoved ? '0' : 'calc(var(--gap) / 2) var(--gap)'};
  margin-bottom: ${({ isRemoved }) => isRemoved ? '0' : 'calc(var(--gap) * 2)'};
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  color: ${AdditionalLight};
`;

export default Alerts;
