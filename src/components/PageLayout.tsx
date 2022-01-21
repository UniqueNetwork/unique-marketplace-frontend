import React, { FC, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout } from '@unique-nft/ui-kit';
import Footer from './Footer';
import Header from './Header';

const PageLayout: FC = (props) => {
  const { pathname } = useLocation();

  const layoutProps = useMemo(() => {
    if (pathname === '/') return { heading: 'Block Explorer' };

    if (/^\/extrinsic\//.test(pathname)) { return { breadcrumbs: { options: [{ link: '/', title: 'Home' }, { title: 'Extrinsic' }] } }; }

    if (/^\/account\//.test(pathname)) { return { breadcrumbs: { options: [{ link: '/', title: 'Home' }, { title: 'Account' }] } }; }
  }, [pathname]);

  return (
    <Layout
{...layoutProps}
footer={<Footer />}
header={<Header />}
    >
      <Outlet />
    </Layout>
  );
};

export default PageLayout;
