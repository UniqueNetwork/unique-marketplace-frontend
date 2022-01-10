import './app.scss';
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Account, Extrinsic, Main } from './pages'
import PageLayout from './components/PageLayout';

export default function App() {
  return (
    <div className={'app-wrapper'}>
      <Router>
        <PageLayout>
          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/account/:accountId" element={<Account />} />
            <Route path="/extrinsic/:blockIndex" element={<Extrinsic />} />
          </Routes>
        </PageLayout>
      </Router>
    </div>
  )
}
