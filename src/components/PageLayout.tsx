import { FC, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';
import { Header } from '.';

export type TMenuItems = 'Market' | 'My tokens' | 'Trades' | 'FAQ';

export const PageLayout: FC = () => {
  const { pathname } = useLocation();

  const layoutProps = useMemo(() => {
    if (pathname === '/') return { heading: 'Market' };

    if (pathname === '/myTokens') {
      return { heading: 'My tokens' };
    }

    if (pathname === '/trades') {
      return { heading: 'Trades' };
    }

    if (pathname === '/faq') {
      return { heading: 'FAQ' };
    }

    // if (/^\/myStuff\//.test(pathname)) { return { breadcrumbs: { options: [{ link: '/', title: 'Home' }, { title: 'My Stuff' }] } }; }

    // if (/^\/trades\//.test(pathname)) { return { breadcrumbs: { options: [{ link: '/', title: 'Home' }, { title: 'Trades' }] } }; }
  }, [pathname]);

  return (
    <LayoutStyled>
      <Layout
        {...layoutProps}
        // footer={<div>Footer</div>}
        header={
          <Header
            activeItem={(layoutProps?.heading as TMenuItems) || 'Market'}
          />
        }
      >
        <Outlet />
      </Layout>
    </LayoutStyled>
  );
};

const LayoutStyled = styled.div`
  main {
    > div {
      display: flex;
    }
  }
`;
