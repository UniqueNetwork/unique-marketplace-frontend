import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { Market, MyTokens, Collection, Accounts, Trades, FAQ, TokenPage, Collections } from './pages';
import { GlobalStyle } from './styles';
import { Error404 } from './pages/Errors/404';

const commonRoutes = (<>
  <Route
    element={<TokenPage />}
    path={'token/:collectionId/:id'}
  />
  <Route
    element={<Collection />}
    path={'collection/:collectionId'}
  />
  <Route
    element={<Market />}
    path={'market'}
  />
  <Route
    element={<MyTokens />}
    path={'myTokens'}
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
    element={<FAQ />}
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
            element={<Navigate to='market' />}
            path={'*'}
          />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
