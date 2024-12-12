import { Outlet } from 'react-router-dom';
import { Notifications } from 'components/UI';
import config from './config';
import ApiWrapper from './api/ApiWrapper';
import { PageLayout, IntroSlider } from './components';
import { AccountWrapper } from 'account/AccountProvider';
import CollectionsWrapper from './collections/CollectionsProvider';
import { ConnectWalletModalProvider } from 'account/ConnectWalletModalContext';
import { WalletConnectProviders } from 'account/WalletConnectContext/WalletConnectProviders';
import { SelectedTokensProvider } from 'pages/MyTokens/context/SellTokensContext';

document.title = config.documentTitle || 'Unique Market';

export default function App() {
  return (
    <Notifications closingDelay={2 * 1000}>
      <WalletConnectProviders>
        <ApiWrapper>
          <AccountWrapper>
            <ConnectWalletModalProvider>
              <SelectedTokensProvider>
                <CollectionsWrapper>
                  <IntroSlider />
                  <PageLayout>
                    <Outlet />
                  </PageLayout>
                </CollectionsWrapper>
              </SelectedTokensProvider>
            </ConnectWalletModalProvider>
          </AccountWrapper>
        </ApiWrapper>
      </WalletConnectProviders>
    </Notifications>
  );
}
