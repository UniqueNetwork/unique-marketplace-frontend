import React, { FC, useEffect } from 'react';
import { InputText, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { PagePaper } from '../../components/PagePaper/PagePaper';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../hooks/useNotification';
import { NotificationSeverity } from '../../notification/NotificationContext';
import { useAdminLoggingIn } from '../../api/restApi/admin/login';
import { useAccounts } from '../../hooks/useAccounts';

export const AdminLoginPage: FC = () => {
  const { isLoading: isAccountsLoading } = useAccounts();
  const { logIn } = useAdminLoggingIn();
  const navigate = useNavigate();
  const { push } = useNotification();

  useEffect(() => {
    if (isAccountsLoading) return;
    void (async () => {
      const jwtoken = await logIn();
      if (!jwtoken) {
        push({ message: 'Unable to login, please try again!', severity: NotificationSeverity.error });
        navigate('/');
      } else {
        navigate('/administration');
      }
    })();
  }, [isAccountsLoading]);

  return (<PagePaper>
    <AuthorizationMessageWrapper>
      <Text>Need to authorize administrator: sign the message to get access</Text>
    </AuthorizationMessageWrapper>
  </PagePaper>);
};

const AuthorizationMessageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
