import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    /* Constants */
    --gap: 16px;
    
    /* colors */
    --grey-300: #D2D3D6;
  }

/* reset default browser css */

a{
    text-decoration: none;
}

.unique-modal {
  overflow: visible;
}
`;

export const SaduStyle = createGlobalStyle`
  ::selection {
    color: var(--color-additional-light);
    background: var(--color-primary-700);
  }
  
  ::-webkit-scrollbar {
      width: 8px;
  }

  ::-webkit-scrollbar-track {
      background: var(-color-additional-dark);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--color-primary-600);
    border-radius: 24px;
  }
    
  ::-webkit-scrollbar-thumb:hover {
    background: var(--color-primary-700);
  }
  /* reset default browser css */
  .unique-text {
    color: var(--color-additional-light) !important;
  }
  .unique-avatar {
    display: none;
  }
  .unique-input-text {
    .input-wrapper {
      border: none;
      border-radius: 8px;
      input {
        background: rgb(35, 31, 32);
        &:focus {
          border: none;
        }
      }
    }
  }
  .unique-checkbox-wrapper {
    .checkmark {
      background: rgb(35, 31, 32);
      border: none;
      &:hover {
        border: 1px solid rgb(90, 125, 124);
      }
      &.checked {
        border-radius: 4px;
        width: 20px;
        height: 20px;
        padding: 2px;
      }
    }
  }
  a{
      text-decoration: none;
  }
  .unique-modal {
    overflow: visible;
  }
`;
