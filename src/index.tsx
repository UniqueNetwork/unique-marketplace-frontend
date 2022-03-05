import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { Market, MyTokens, Accounts, Trades, FAQ, TokenPage } from './pages';
import { MarketMainPage } from './pages/Market/MarketMain';
import { GlobalStyle } from './styles';

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
          <Route
            element={<TokenPage />}
            path={'/token/:collectionId/:id'}
          />
          <Route
            element={<Market />}
            path={'market'}
          >
            <Route
              element={<MarketMainPage />}
              index
            />
          </Route>
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
            element={<Navigate to='market' />}
            path={'*'}
          />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
