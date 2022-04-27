import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    /* Constants */
    --gap: 16px;
    
    /* colors */
    --grey-300: #D2D3D6;
  }
  ::selection {
    color: #fff;
    background: #439595;
  }
/* reset default browser css */

a{
    text-decoration: none;
}

.unique-modal {
  overflow: visible;
}
`;
