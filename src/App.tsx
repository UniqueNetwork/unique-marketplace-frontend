// contains gql and rpc with contexts and providers
import ApiWrapper from './api/ApiWrapper';
import { PageLayout } from './components';
import AccountWrapper from './account/AccountProvider';

export default function App() {
  return (
    <ApiWrapper>
      <AccountWrapper>
        <PageLayout />
      </AccountWrapper>
    </ApiWrapper>
  );
}
