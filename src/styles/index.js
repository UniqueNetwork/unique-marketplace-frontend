import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    /* Constants */
    --prop-gap: 16px;
    --prop-font-family: 'Inter', sans-serif;
    --prop-font-family-heading: 'Raleway', sans-serif;
    --prop-font-size: 14px;
    --prop-font-weight: 400;
    --prop-border-radius: 4px;
    --prop-stepper-circle-size: 40px;
    --prop-container-width: 1800px;
    --prop-shadow: rgba(0, 0, 0, 0.08);

    /* colors */
    --color-primary-700: #006499;
    --color-primary-600: #0085CC;
    --color-primary-500: #009CF0;
    --color-primary-400: #15ADFF;
    --color-primary-300: #66CAFF;
    --color-primary-200: #C7EBFF;
    --color-primary-100: #F5FCFF;

    --color-secondary-700: #02040B;
    --color-secondary-600: #030814;
    --color-secondary-500: #040B1D;
    --color-secondary-400: #091941;
    --color-secondary-300: #0B1F53;
    --color-secondary-200: #0E2665;
    --color-secondary-100: #102D77;

    --color-blue-grey-700: #5A6A7A;
    --color-blue-grey-600: #647789;
    --color-blue-grey-500: #7F90A1;
    --color-blue-grey-400: #9CAAB7;
    --color-blue-grey-300: #ABB6C1;
    --color-blue-grey-200: #C9D0D7;
    --color-blue-grey-100: #F5F6F7;

    --color-grey-700: #5C5F67;
    --color-grey-600: #686C74;
    --color-grey-500: #81858E;
    --color-grey-400: #C4C6CA;
    --color-grey-300: #D2D3D6;
    --color-grey-200: #DFE0E2;
    --color-grey-100: #EDEDEE;
    --color-table-grey: #b9b9b9;

    --color-coral-700: #F73800;
    --color-coral-600: #FF430C;
    --color-coral-500: #FF6335;
    --color-coral-400: #FF9E82;
    --color-coral-300: #FFB29B;
    --color-coral-200: #FFD1C4;
    --color-coral-100: #FFF1ED;

    --color-additional-light: #FFFFFF;
    --color-additional-dark: #040B1D;
    --color-additional-positive-500: #2DBF15;
    --color-additional-positive-100: #E9FCE6;
    --color-additional-warning-500: #F9A400;
    --color-additional-warning-100: #FFF4E0;
    --color-additional-coral-500: #FB838D;

    /* specific for dafc */
    --color-footer-background: #FFFFFF;
    --color-layout-background: #F5F6F7;
    --prop-border-radius: 4px;
    font-feature-settings: 'pnum' on, 'lnum' on;
  }
/* reset default browser css */
a{
    text-decoration: none;
}

.unique-modal {
  overflow: visible;
}

/* fix tooltip with clickable content */
.unique-tooltip {
  span {
    z-index: 101; 
  }
}

.notification-container {
  position: fixed;
}

`;
