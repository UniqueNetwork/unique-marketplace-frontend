import { Outlet } from 'react-router-dom';
import config from './config';
// contains gql and rpc with contexts and providers
import ApiWrapper from './api/ApiWrapper';
import { PageLayout } from './components';
import AccountWrapper from './account/AccountProvider';
import NotificationWrapper from './notification/NotificationWrapper';

document.title = config.documentTitle || 'Sadu - Marketplace';

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
