import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import {
  Market,
  MyTokens,
  Collection,
  Accounts,
  Trades,
  Faq,
  TokenPage,
  Collections,
  CollectionEdit,
} from './pages';
import { GlobalStyle } from './styles';
import { Error404 } from './pages/Errors/404';
import { TokenContextProvider } from 'pages/Token/context/TokenContext';
import { CreateNFT } from 'pages/CreateNFT';
import { CreateCollectionPage } from 'pages/CreateCollection';
import { MainInformation } from 'pages/CreateCollection/tabs';
import { CollectionSettings } from 'pages/CreateCollection/tabs/CollectionSettings';
import { CollectionLinks } from 'pages/CreateCollection/tabs/CollectionLinks';
import { CREATE_COLLECTION_TABS_ROUTE } from 'pages/CreateCollection/constants';
import { CollectionSettingsProvider } from 'pages/CreateCollection/tabs/CollectionSettingsProvider';

const commonRoutes = (
  <>
    <Route
      path="token/:address/:collectionId/:id"
      element={
        <TokenContextProvider>
          <TokenPage />
        </TokenContextProvider>
      }
    />
    <Route
      path="token/:collectionId/:id"
      element={
        <TokenContextProvider>
          <TokenPage />
        </TokenContextProvider>
      }
    />
    <Route path="collection/:collectionId">
      <Route index element={<Collection />} />
      <Route path="edit" element={<CollectionEdit />} />
    </Route>
    <Route path="market" element={<Market />} />
    <Route path="sellTokens" element={<MyTokens />} />
    <Route path="accounts" element={<Accounts />} />
    <Route path="trades" element={<Trades />} />
    <Route path="create-token" element={<CreateNFT />} />
    <Route
      path="create-collection"
      element={
        <CollectionSettingsProvider>
          <CreateCollectionPage />
        </CollectionSettingsProvider>
      }
    >
      <Route path={CREATE_COLLECTION_TABS_ROUTE.MAIN_INFORMATION} element={<MainInformation />} />
      <Route path={CREATE_COLLECTION_TABS_ROUTE.COLLECTIONS_SETTINGS} element={<CollectionSettings />} />
      <Route path={CREATE_COLLECTION_TABS_ROUTE.LINKS} element={<CollectionLinks />} />
    </Route>
    <Route path="faq" element={<Faq />} />
    <Route path="collections">
      <Route index element={<Collections />} />
    </Route>
  </>
);

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  // <React.StrictMode>
  <>
    <GlobalStyle />
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          {/* Redirect from root to /market */}
          <Route index element={<Navigate to="market" replace />} />
          {/* Include common routes */}
          {commonRoutes}
          {/* Chain ID routes */}
          <Route path=":chainId">
            {commonRoutes}
          </Route>
          {/* 404 Error route */}
          <Route path="*" element={<Error404 />} />
        </Route>
      </Routes>
    </Router>
  </>
  // </React.StrictMode>
);
