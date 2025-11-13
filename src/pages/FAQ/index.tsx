import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';

import { AskQuestion, faqItems } from './components';
import { useApi } from 'hooks/useApi';
import { Accordion } from 'components/UI';

type LocationState = {
  isNestedInfo?: boolean;
};

const READ_ITEMS_KEY = 'new-wallet-read-faq';

const FaqComponent = (): React.ReactElement<void> => {
  const { currentChainId } = useApi();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  useEffect(() => {
    window.history.replaceState({}, document.title);
  }, []);

  const [readFaqItems, setReadFaqItems] = useState<string[]>(
    localStorage.getItem(READ_ITEMS_KEY)?.split(',') || []
  );

  const onToggleItem = useCallback(
    (index: number) => (isOpen: boolean) => {
      setReadFaqItems((readFaqItems) => {
        if (!isOpen || readFaqItems.includes(index.toString())) {
          return readFaqItems;
        }
        localStorage.setItem(READ_ITEMS_KEY, [...readFaqItems, index].join(','));
        return [...readFaqItems, index.toString()];
      });
    },
    []
  );

  const keys = Object.keys(state);

  return (
    <MainWrapperStyled>
      <WrapperContentStyled>
        {faqItems(currentChainId || '', state).map(
          (item: Record<string, ReactNode>, i: number) => {
            return (
              <Accordion
                key={i}
                className='faq-item'
                isOpen={keys.length > 0 ? Boolean(item.defaultExpanded) : i === 0}
                title={
                  <>
                    {item.title}
                    {item.isNew && !readFaqItems.includes(i.toString()) && (
                      <span className='tooltip'>NEW</span>
                    )}
                  </>
                }
                onToggle={onToggleItem(i)}
              >
                <div>{item.content}</div>
              </Accordion>
            );
          }
        )}
      </WrapperContentStyled>
      <WrapperSidebar>
        <AskQuestion />
      </WrapperSidebar>
    </MainWrapperStyled>
  );
};

export const MainWrapper = styled.div`
  @media screen and (min-width: 1025px) {
    display: flex;
    align-items: flex-start;
  }
`;

const MainWrapperStyled = styled(MainWrapper)`
  @media only screen and (min-width: 800px) and (max-width: 1024px) {
    width: 85%;
  }
  
  .unique-modal-wrapper {
    padding: calc(var(--prop-gap) * 5) 5%;
    box-sizing: border-box;
    
    @media screen and (max-width: 567px) {
      .unique-modal {
        padding: calc(var(--prop-gap));
        
        .unique-font-heading {
          font-size: 24px;
          text-align: left;
        }
        
        .close-button {
          top: 20px;
        }
      }
    }
  }
  `;

export const WrapperContent = styled.div`
  box-sizing: border-box;
  
  @media screen and (min-width: 1025px) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-radius: var(--prop-border-radius);
    padding: calc(var(--prop-gap) * 2);
    background-color: var(--color-additional-light);
    flex: 1 1 66.6666%;
  }
`;

export const WrapperSidebar = styled.aside`
  box-sizing: border-box;
  overflow: hidden;
  margin: calc(var(--prop-gap) * 2) 0;

  @media screen and (min-width: 1025px) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-radius: var(--prop-border-radius);
    padding: calc(var(--prop-gap) * 2);
    background-color: var(--color-additional-light);
    flex: 1 1 33.3333%;
    max-width: 600px;
    margin: 0 0 0 calc(var(--prop-gap) * 2);
  }

  @media only screen and (min-width: 1025px) and (max-width: 1500px) {
    margin: 0 0 0 calc(var(--prop-gap) * 1.5);
  }
`;

const WrapperContentStyled = styled(WrapperContent)`
  .faq-item {
    position: relative;
    border-bottom: 1px dashed var(--color-blue-grey-300);
    font-size: 1rem;
    line-height: 1.4;
    color: var(--color-additional-dark);
    a {
      white-space: break-spaces;
    }

    .tooltip {
      position: absolute;
      width: 48px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      right: 0;
      top: 0;
      background: var(--color-primary-300);
      color: var(--color-additional-light);
      @media screen and (max-width: 567px) {
        width: 24px;
        height: 12px;
        font-size: 8px;
      }
    }

    &:not(:last-child) {
      margin-bottom: calc(var(--prop-gap) * 2);
    }

    div[class^='Accordion__AccordionTitle'] {
      margin-bottom: var(--prop-gap);
      column-gap: calc(var(--prop-gap) / 2);
      & > span {
        color: inherit;
        font-weight: 700;
        font-size: 1.25rem;
        font-family: Raleway;
      }
      @media screen and (max-width: 567px) {
        margin-right: 40px;
      }
    }

    div[class^='Accordion__AccordionBodyWrapper'] {
      padding: 10px;
      line-height: 1.5;
      background-color: var(--color-blue-grey-100);
    }

    ol,
    ul,
    .unique-link {
      font: inherit;
    }

    ol,
    ul {
      padding-left: 1.5em;

      li {
        &:not(:first-child) {
          margin-top: 0.1em;
        }
      }
    }

    ol {
      list-style-position: inside;
    }

    ul,
    ol,
    p {
      & + p {
        margin-top: 1.125em;
      }
    }

    a:not([class]),
    .unique-link {
      gap: 2px;
      color: var(--color-primary-600);

      &:hover {
        text-decoration: underline;
        text-decoration-thickness: 1px;
        text-underline-offset: 0.3em;
      }

      &:focus-visible {
        outline: -webkit-focus-ring-color auto 1px;
      }
    }
  }
`;

export const Faq = FaqComponent;
