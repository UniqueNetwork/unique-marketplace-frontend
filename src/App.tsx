import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

const ExamplePage = () => {
  return <div>Example</div>
}

export default function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">1</Link>
            </li>
            <li>
              <Link to="/2">2</Link>
            </li>
            <li>
              <Link to="/3">3</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Routes>
          <Route path="/" element={<ExamplePage />} />
          <Route path="/2" element={<ExamplePage />} />
          <Route path="/3" element={<ExamplePage />} />
        </Routes>
      </div>
    </Router>
  )
}
