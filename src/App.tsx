import { Outlet } from 'react-router-dom';
// contains gql and rpc with contexts and providers
import ApiWrapper from './api/ApiWrapper';
import { PageLayout } from './components';
import AccountWrapper from './account/AccountProvider';
import NotificationWrapper from './notification/NotificationWrapper';

export default function App() {
  return (
    <NotificationWrapper>
      <ApiWrapper>
        <AccountWrapper>
          <PageLayout>
            <Outlet />
          </PageLayout>
        </AccountWrapper>
      </ApiWrapper>
    </NotificationWrapper>
  );
}
