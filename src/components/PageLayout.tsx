import { FC, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';
import { Header } from '.';
import { useFooter } from '../hooks/useFooter';
import useBackground from '../hooks/useBackground';
import { LightBackground } from '../styles/colors';

export type TMenuItems = 'Market' | 'My tokens' | 'Trades' | 'FAQ' | 'Manage accounts';

export const PageLayout: FC = () => {
  const { pathname } = useLocation();
  const footer = useFooter();
  const backgroundImage = useBackground();

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
    <BgLayoutStyled backgroundImage={backgroundImage}>
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
    </BgLayoutStyled>
  );
};

const LayoutStyled = styled.div`

  /* specific for dafc */
  .unique-layout {
    background: var(--color-layout-background);
    
    header {
      background: ${LightBackground};
    }

    @media (max-width: 1024px) {
      background: var(--color-additional-light);
    }

    .unique-font-heading.size-1 {
      font-family: var(--font-heading);
    }

    footer {
      background-color: var(--color-footer-background);

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

const BgLayoutStyled = styled(LayoutStyled)<{ backgroundImage: string | null }>`
  .unique-layout {
    min-height: 100vh;
    background-image: url(${(props) => props.backgroundImage});
    background-position: inherit;
    background-position-x: inherit;
    background-position-y: inherit;
    background-size: cover;
    background-repeat: round;
    background-attachment: fixed;
  }
`;
