import { Outlet } from 'react-router-dom';
import { Notifications } from 'components/UI';
import config from './config';
import ApiWrapper from './api/ApiWrapper';
import { PageLayout, IntroSlider } from './components';
import { AccountWrapper } from 'account/AccountProvider';
import CollectionsWrapper from './collections/CollectionsProvider';
import { ConnectWalletModalProvider } from 'account/ConnectWalletModalContext';

document.title = config.documentTitle || 'Unique Market';

import { createAppKit } from '@reown/appkit/react'
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'
import { unique, uniqueOpal, uniqueQuartz } from '@reown/appkit/networks'

const projectId = 'f7355c4a8483073af9629880e7887524';

const metadata = {
  name: 'Unique marketplace',
  description: 'Unique marketplace',
  url: 'https://market.uniquenetwork.dev/',
  icons: ['https://avatars.mywebsite.com/']
};

createAppKit({
  adapters: [new Ethers5Adapter()],
  metadata: metadata,
  networks: [
    unique,
    uniqueOpal,
    uniqueQuartz
  ],
  projectId,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

export default function App() {
  return (
    <Notifications closingDelay={2 * 1000}>
      <ApiWrapper>
        <AccountWrapper>
          <ConnectWalletModalProvider>
            <CollectionsWrapper>
              <IntroSlider />
              <PageLayout>
                <Outlet />
              </PageLayout>
            </CollectionsWrapper>
          </ConnectWalletModalProvider>
        </AccountWrapper>
      </ApiWrapper>
    </Notifications>
  );
}
