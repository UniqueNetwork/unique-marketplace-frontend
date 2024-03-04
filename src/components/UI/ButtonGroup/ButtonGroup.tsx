import styled from 'styled-components';

export const ButtonGroup = styled.div<{
  align?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  $fill?: boolean;
  gap?: number;
  stack?: boolean;
}>`
  && {
    margin-top: var(--prop-gap);
    flex: 1 1 auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: ${(p) => p.align};
    gap: ${(p) => (p.gap ? `${p.gap}px` : 'calc(var(--prop-gap) / 2) var(--prop-gap)')};

    @media (min-width: 568px) {
      flex: 0 0 auto;
    }

    & > * {
      flex: ${(p) => (p.stack ? '1 1 100%' : p.$fill ? '1 1 auto' : '0 0 auto')};

      @media screen and (min-width: 568px) {
        flex: 0 0 auto;
      }

      & > .unique-button {
        box-sizing: border-box;
        width: 100%;
      }
    }
  }
`;
