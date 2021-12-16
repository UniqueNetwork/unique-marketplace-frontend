import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Account, Collections, Extrinsic, Main, Tokens, Transfers } from './pages'
import Header from './components/Header'
import Footer from './components/Footer'
import './app.scss';

export default function App() {
  return (
    <div className={'app-wrapper'}>
      <Router>
        <Header />
        <div className={'app-container app-container--card'}>
          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/account/:accountId" element={<Account />} />
            <Route path="/extrinsic/:blockIndex" element={<Extrinsic />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </div>
  )
}
