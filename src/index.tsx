import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { Market, MyTokens, Trades, FAQ } from './pages';
import { MarketMainPage } from './pages/Market/MarketMain';
import { TokensPage } from './components/TokenDetailPage';

ReactDOM.render(
  <React.StrictMode>
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
            element={<Market />}
            path={'market'}
          >
            <Route
              element={<MarketMainPage />}
              index
            />
            <Route
              element={<TokensPage />}
              path={'token-details'}
            />
          </Route>
          <Route
            element={<MyTokens />}
            path={'myTokens'}
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
