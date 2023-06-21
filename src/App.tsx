import { Outlet } from 'react-router-dom';
import { Notifications } from 'components/UI';
import config from './config';
// contains gql and rpc with contexts and providers
import ApiWrapper from './api/ApiWrapper';
import { PageLayout, IntroSlider } from './components';
import AccountWrapper from './account/AccountProvider';
import CollectionsWrapper from './collections/CollectionsProvider';

document.title = config.documentTitle || 'Unique Market';

export default function App() {
  return (
    <Notifications closingDelay={2 * 1000}>
      <ApiWrapper>
        <AccountWrapper>
          <CollectionsWrapper>
            <IntroSlider />
            <PageLayout>
              <Outlet />
            </PageLayout>
          </CollectionsWrapper>
        </AccountWrapper>
      </ApiWrapper>
    </Notifications>
  );
}
