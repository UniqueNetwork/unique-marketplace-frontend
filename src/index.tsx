import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Market, MyTokens, Trades, FAQ } from './pages';
import 'normalize.css';
import 'the-new-css-reset/css/reset.css';

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
