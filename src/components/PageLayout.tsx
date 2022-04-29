import { FC, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';
import { Header } from '.';
import { useFooter } from '../hooks/useFooter';

export type TMenuItems = 'Market' | 'My tokens' | 'Trades' | 'FAQ' | 'Manage accounts';

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

    if (pathname === '/market/token') {
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

  /* specific for dafc */
  .unique-layout {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-image: url("./logos/background.png");
    background-position: inherit;
    background-size: cover;
    background-repeat: round;
    background-attachment: fixed;

    @media (max-width: 1024px) {
      background: var(--color-additional-light);
    }

    .unique-font-heading.size-1 {
      font-size: 40px;
      text-align: left;
      text-transform: uppercase;
      font-weight: 500;
      color: var( --color-additional-light);
      font-family: var(--font-heading);
    }

    footer {
      background: var(--card-background);

      .footer__text {
        color: var(--color-additional-light);
      }

      .footer__text__dafc {
        color: var(--color-additional-light);
        font-size: 16px;
        line-height: 24px;
      }
      @media (max-width: 568px) {
        padding-bottom: calc(var(--gap) * 5);
      }
    }
  }

  .unique-modal-wrapper .unique-modal {
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .unique-layout__content {
    padding: 0 !important;
    background-color: transparent !important;
    box-shadow: none !important;
    display: flex;
    flex-direction: column;
    row-gap: calc(var(--gap) * 1.5);
  }


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
    @media (max-width: 1024px) {
      padding-bottom: 40px;
    }
  }

  header {
    background: transparent;
    top: 0;
    position: sticky !important;
    z-index: 990;
    @media (max-width: 620px) {
      height: 80px !important;
    }
  }
  
  footer {
    @media (max-width: 568px) {
      height: unset;
    }
    &>div {
      display: flex;
      align-items: center;
      height: 64px;
      justify-content: space-between;
      width: 100%;
      @media (max-width: 568px) {
        padding: var(--gap) 0;
        flex-direction: column;
        align-items: flex-start;
      }
    }
  }

  .unique-tabs-labels {
    flex-wrap: nowrap;
  }
`;
