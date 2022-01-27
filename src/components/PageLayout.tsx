import { FC, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout } from '@unique-nft/ui-kit';
import { Header } from '.';

export const PageLayout: FC = () => {
  const { pathname } = useLocation();

  const layoutProps = useMemo(() => {
    if (pathname === '/') return { heading: 'Market' };

    if (pathname === '/myTokens') { return { heading: 'My tokens' }; }

    if (pathname === '/trades') { return { heading: 'Trades' }; }

    if (pathname === '/faq') { return { heading: 'FAQ' }; }

    // if (/^\/myStuff\//.test(pathname)) { return { breadcrumbs: { options: [{ link: '/', title: 'Home' }, { title: 'My Stuff' }] } }; }

    // if (/^\/trades\//.test(pathname)) { return { breadcrumbs: { options: [{ link: '/', title: 'Home' }, { title: 'Trades' }] } }; }
  }, [pathname]);

  return (
    <Layout
{...layoutProps}
// footer={<div>Footer</div>}
header={<Header />}
    >
      <Outlet />
    </Layout>
  );
};
