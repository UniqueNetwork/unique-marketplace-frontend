import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { Market, MyTokens, Collection, Accounts, Trades, Faq, TokenPage, Collections, CollectionEdit } from './pages';
import { GlobalStyle } from './styles';
import { Error404 } from './pages/Errors/404';
import { TokenContextProvider } from 'pages/Token/context/TokenContext';
import { CreateNFTv2 } from 'pages/CreateNFT';
import { CreateCollectionPage } from 'pages/CreateCollection';
import { MainInformation, NFTAttributes } from 'pages/CreateCollection/tabs';

const commonRoutes = (<>
  <Route
    element={<TokenContextProvider><TokenPage /></TokenContextProvider>}
    path={'token/:address/:collectionId/:id'}
  />
  <Route
    element={<TokenContextProvider><TokenPage /></TokenContextProvider>}
    path={'token/:collectionId/:id'}
  />
  <Route
    path={'collection/:collectionId'}
  >
    <Route
      element={<Collection />}
      index
    />
    <Route
      path={'edit'}
      element={<CollectionEdit />}
    />
  </Route>
  <Route
    element={<Market />}
    path={'market'}
  />
  <Route
    element={<MyTokens />}
    path={'sellTokens'}
  />
  <Route
    element={<Accounts />}
    path={'accounts'}
  />
  <Route
    element={<Trades />}
    path={'trades'}
  />
  <Route
    element={<CreateNFTv2 />}
    path={'create-token'}
  />
  <Route
    element={<CreateCollectionPage />}
    path={'create-collection'}
  >
    <Route
      element={<MainInformation />}
      path={'main-information'}
    />
    <Route
      element={<NFTAttributes />}
      path={'nft-attributes'}
    />
  </Route>
  <Route
    element={<Faq />}
    path={'faq'}
  />
  <Route
    path={'collections'}
  >
    <Route
      element={<Collections />}
      index
    />
  </Route>
  <Route
    element={<Error404 />}
    index
  />
</>);

ReactDOM.render(
  <React.StrictMode>
    <GlobalStyle />
    <Router>
      <Routes>
        <Route
          element={<App />}
          path={'/'}
        >
          <Route
            element={<Navigate to='market' />}
            index
          />
          {commonRoutes}
          <Route path={':chainId/'}>
            {commonRoutes}
          </Route>
          <Route
            element={<Error404 />}
            path={'404'}
          />
          <Route
            element={<Error404 />}
            path={'/*'}
          />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
