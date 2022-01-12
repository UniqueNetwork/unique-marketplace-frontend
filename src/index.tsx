import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Account, Block, Extrinsic, Main } from './pages'

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path={'/'} element={<App />}>
          <Route index={true} element={<Main />} />
          <Route path={':chainId/'}>
            <Route index={true} element={<Main />} />
            <Route path={'account/:accountId'} element={<Account />} />
            <Route path={'extrinsic/:blockIndex'} element={<Extrinsic />} />
            <Route path={'block/:blockIndex'} element={<Block />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
)
