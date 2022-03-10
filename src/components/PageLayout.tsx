import { FC, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';
import { Header } from '.';
import { useFooter } from '../hooks/useFooter';

export type TMenuItems = 'Market' | 'My tokens' | 'Trades' | 'FAQ';

export const PageLayout: FC = () => {
  const { pathname } = useLocation();
  const footer = useFooter();

  const layoutProps = useMemo(() => {
    if (pathname === '/market') return { heading: 'Market' };

    if (pathname === '/myTokens') {
      return { heading: 'My tokens' };
    }

    if (pathname === '/trades') {
      return { heading: 'Trades' };
    }

    if (pathname === '/faq') {
      return { heading: 'FAQ' };
    }

    if (pathname === '/accounts') {
      return { heading: 'Manage accounts' };
    }

    if (pathname === '/market/token-details') {
      return {
        breadcrumbs: {
          options: [{ link: '/market', title: 'Market' }, { title: 'Token' }]
        }
      };
    }
  }, [pathname]);

  return (
    <LayoutStyled>
      <Layout
        {...layoutProps}
        footer={<div dangerouslySetInnerHTML={{ __html: footer }} />}
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

    /* Todo: remove after done task https://cryptousetech.atlassian.net/browse/NFTPAR-1238 */
    .unique-breadcrumbs-wrapper {
      align-items: center;

      .breadcrumb-item {
        line-height: 22px;
      }
    }
  }
  footer {
    &>div {
      display: flex;
      align-items: center;
      height: 64px;
      justify-content: space-between;
      width: 100%;
    }
  }
`;
