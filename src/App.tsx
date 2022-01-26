import './app.scss';
import { Outlet } from 'react-router-dom';
// contains gql and rpc with contexts and providers
import ApiWrapper from './api/ApiWrapper';
import { PageLayout } from './components';

export default function App () {
  return (
    <div className={'app-wrapper'}>
      <ApiWrapper>
        <PageLayout>
          <Outlet />
        </PageLayout>
      </ApiWrapper>
    </div>
  );
}
