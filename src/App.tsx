import './app.scss';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import PageLayout from './components/PageLayout';
// contains gql and rpc with contexts and providers
import ApiWrapper from './api/ApiWrapper';

export default function App () {
  return (
    <div className={'app-wrapper'}>
      <ApiWrapper>
        <PageLayout>
          <Outlet />
        </PageLayout>
      </ApiWrapper>
    </div>
  );
}
