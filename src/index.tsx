import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { Market, MyTokens, Accounts, Trades, FAQ, TokenPage } from './pages';
import { GlobalStyle, SaduStyle } from './styles';

ReactDOM.render(
  <React.StrictMode>
    <SaduStyle />
    <GlobalStyle />
    <Router>
      <Routes>
        <Route
          element={<App />}
          path={'/'}
        >
          <Route
            element={<Navigate to='exhibition' />}
            index
          />
          <Route
            element={<TokenPage />}
            path={'/token/:collectionId/:id'}
          />
          <Route
            element={<Market />}
            path={'exhibition'}
          >
            <Route
              element={<Market />}
              index
            />
          </Route>
          <Route
            element={<MyTokens />}
            path={'myGallery'}
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
            path={'aboutSadu'}
          />
          <Route
            element={<Navigate to='exhibition' />}
            path={'*'}
          />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
