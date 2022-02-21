import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Market, MyTokens, Trades, FAQ } from './pages';
import TokenPage from './pages/Token';
import { injectExtension } from '@polkadot/extension-inject';

// injectExtension((origin) => {
//   return Promise.resolve();
// }, { name: 'myExtension', version: '1.0.1' });

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route
          element={<App />}
          path={'/'}
        >
          <Route
            element={<Market />}
            index={true}
          />
          <Route
            element={<TokenPage />}
            path={'/token/:collectionId/:id'}
          />
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
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
