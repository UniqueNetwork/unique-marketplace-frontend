// contains gql and rpc with contexts and providers
import ApiWrapper from './api/ApiWrapper';
import { PageLayout } from './components';

export default function App() {
  return (
    <ApiWrapper>
      <PageLayout />
    </ApiWrapper>
  );
}
