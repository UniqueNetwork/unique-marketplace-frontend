import { Outlet } from 'react-router-dom';
import { Notifications } from 'components/UI';
import ApiWrapper from './api/ApiWrapper';
import { PageLayout, IntroSlider } from './components';
import { AccountWrapper } from 'account/AccountProvider';
import CollectionsWrapper from './collections/CollectionsProvider';
import { ConnectWalletModalProvider } from 'account/ConnectWalletModalContext';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const projectId = '45ef57036ca8be148830034ba37dccac';

const metadata = {
  name: 'Marketplace',
  description: 'Unique boilerplate',
  url: 'https://market.uniquenetwork.dev/',
  icons: ['']
};

export const chains = [
  {
    id: 8880,
    name: 'Unique Mainnet',
    nativeCurrency: { name: 'UNQ', symbol: 'UNQ', decimals: 18 },
    rpcUrls: {
      default: {
        http: ['https://rpc.unique.network']
      }
    }
  }
] as const;

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata
});

// Вызов createWeb3Modal до рендеринга компонентов
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  includeWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
    'ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18'
  ],
  enableAnalytics: true,
  enableOnramp: true
});

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </WagmiProvider>
  );
}
