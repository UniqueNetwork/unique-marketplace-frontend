import { Outlet } from 'react-router-dom';
import { Notifications } from '@unique-nft/ui-kit';
import config from './config';
// contains gql and rpc with contexts and providers
import ApiWrapper from './api/ApiWrapper';
import { PageLayout } from './components';
import AccountWrapper from './account/AccountProvider';
import CollectionsWrapper from './collections/CollectionsProvider';

document.title = config.documentTitle || 'Unique Market';

export default function App() {
  return (
    <Notifications closingDelay={2 * 1000}>
      <ApiWrapper>
        <AccountWrapper>
          <CollectionsWrapper>
            <PageLayout>
              <Outlet />
            </PageLayout>
          </CollectionsWrapper>
        </AccountWrapper>
      </ApiWrapper>
    </Notifications>
  );
}
