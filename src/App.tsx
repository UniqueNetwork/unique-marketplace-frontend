import './app.scss';
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from '@unique-nft/ui-kit'
import { Account, Extrinsic, Main } from './pages'

export default function App() {
  return (
    <div className={'app-wrapper'}>
      <Router>
        <Layout>
          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/account/:accountId" element={<Account />} />
            <Route path="/extrinsic/:blockIndex" element={<Extrinsic />} />
          </Routes>
        </Layout>
      </Router>
    </div>
  )
}
