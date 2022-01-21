import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Account, Block, Extrinsic, Main } from './pages';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route
          element={<App />}
          path={'/'}
        >
          <Route
            element={<Main />}
            index={true}
          />
          <Route path={':chainId/'}>
            <Route
              element={<Main />}
              index={true}
            />
            <Route
              element={<Account />}
              path={'account/:accountId'}
            />
            <Route
              element={<Extrinsic />}
              path={'extrinsic/:blockIndex'}
            />
            <Route
              element={<Block />}
              path={'block/:blockIndex'}
            />
          </Route>
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
