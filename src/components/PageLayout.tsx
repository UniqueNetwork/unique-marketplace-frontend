import React, { FC, useMemo } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Layout } from '@unique-nft/ui-kit';
import { Header } from './Header/Header';

const PageLayout: FC = (props) => {
  const { pathname } = useLocation();

  const layoutProps = useMemo(() => {
    if (pathname === '/') return { heading: 'Market' };

    if (pathname === '/myTokens') { return { heading: 'My tokens' }; }

    if (pathname === '/trades') { return { heading: 'Trades' }; }

    if (pathname === '/faq') { return { heading: 'FAQ' }; }

    // if (/^\/myStuff\//.test(pathname)) { return { breadcrumbs: { options: [{ link: '/', title: 'Home' }, { title: 'My Stuff' }] } }; }

    // if (/^\/trades\//.test(pathname)) { return { breadcrumbs: { options: [{ link: '/', title: 'Home' }, { title: 'Trades' }] } }; }
  }, [pathname]);

  console.log('layoutProps', layoutProps);
  console.log('pathname', pathname);

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

export default PageLayout;
