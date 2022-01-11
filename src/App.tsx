import './app.scss'
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import PageLayout from './components/PageLayout'
import Api from './Api'

export default function App() {
  return (
    <div className={'app-wrapper'}>
      <Api>
        <PageLayout>
          <Outlet />
        </PageLayout>
      </Api>
    </div>
  )
}
