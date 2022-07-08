import { Outlet } from 'react-router-dom';
import { Notifications } from '@unique-nft/ui-kit';
import config from './config';
// contains gql and rpc with contexts and providers
import ApiWrapper from './api/ApiWrapper';
import { PageLayout } from './components';
import AccountWrapper from './account/AccountProvider';

document.title = config.documentTitle || 'Unique Market';

export default function App() {
  return (
    <Notifications closingDelay={2 * 1000}>
      <ApiWrapper>
        <AccountWrapper>
          <PageLayout>
            <Outlet />
          </PageLayout>
        </AccountWrapper>
      </ApiWrapper>
    </Notifications>
  );
}
