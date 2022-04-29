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
  .unique-table {
    .unique-table-data {
      .unique-table-data-row {
        .unique-link.secondary {
          color: var(--color-secondary-100);
        }
      }
    }
  }
  .unique-pagination-wrapper {
    .pages-wrapper {
      .page-item {
        color: var(--color-secondary-200);
        svg.icon {
          fill: var(--color-secondary-200);
        }
      }
    }
  }
  .unique-modal-wrapper {
    .unique-modal {
      background-color: var(--color-grey-700);
      .close-button {
        svg {
          fill: var(--color-additional-light);  
        }
      }
      .unique-font-heading {
        color: var(--color-additional-light);
      }
    }
  }
  .unique-select {
    
    .select-wrapper {
      color: var(--color-additional-light);

      svg {
        fill: var(--color-secondary-100);
      }

      .select-dropdown {
        background-color: var(--card-background);
      }
    }
  }
  .unique-avatar {
    display: none;
  }
  .unique-input-text {
    .input-wrapper {
      border: none;
      border-radius: 8px;
      &:focus-within {
        border: none;
      }
      input {
        color: var(--color-additional-light);
        background: rgb(35, 31, 32);
        border-radius: 4px;
        &:focus{
          border: 1px solid var(--color-additional-light);
        }
      }
    }
  }

  .unique-checkbox-wrapper {
    .checkmark {
      background: rgb(35, 31, 32);
      border: 1px solid rgb(90, 125, 124);
      &:hover {
        border: 1px solid var(--color-additional-light);
      }
      &.checked {
        border-radius: 4px;
        width: 20px;
        height: 20px;
        padding: 2px;
      }
    }
    label {
      color: var(--color-secondary-100);
    }
  }
  a{
      text-decoration: none;
  }
  .unique-modal {
    overflow: visible;
  }
`;
