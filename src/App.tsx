import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Account, Collections, Extrinsic, Main, Tokens, Transfers } from './pages'

const ExamplePage = () => {
  return <div>Example</div>
}

export default function App() {
  return (
    <>
      <Router>
        <div>
          <nav>
            <ul>
              <li>
                <Link to="/">1</Link>
              </li>
              <li>
                <Link to="/account">account</Link>
              </li>
              <li>
                <Link to="/extrinsic">extrinsic</Link>
              </li>
            </ul>
          </nav>

          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/account" element={<Account />} />
            <Route path="/extrinsic" element={<Extrinsic />} />
          </Routes>
        </div>
      </Router>
    </>
  )
}
