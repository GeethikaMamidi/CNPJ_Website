import React, { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import LoginPage from './pages/LoginPage';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Events = lazy(() => import('./pages/Events'));
const Judges = lazy(() => import('./pages/Judges'));
const Participants = lazy(() => import('./pages/Participants'));
const Judging = lazy(() => import('./pages/Judging'));
const Results = lazy(() => import('./pages/Results'));
const Vendors = lazy(() => import('./pages/Vendors'));
const Mementos = lazy(() => import('./pages/Mementos'));

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('tt_auth') === 'true'
  );

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route 
            path="/" 
            element={
              <Suspense fallback={<LoadingSpinner label="Loading dashboard..." />}>
                <Dashboard />
              </Suspense>
            } 
          />
          <Route 
            path="/events" 
            element={
              <Suspense fallback={<LoadingSpinner label="Loading events..." />}>
                <Events />
              </Suspense>
            } 
          />
          <Route 
            path="/judges" 
            element={
              <Suspense fallback={<LoadingSpinner label="Loading judges..." />}>
                <Judges />
              </Suspense>
            } 
          />
          <Route 
            path="/participants" 
            element={
              <Suspense fallback={<LoadingSpinner label="Loading participants..." />}>
                <Participants />
              </Suspense>
            } 
          />
          <Route 
            path="/judging" 
            element={
              <Suspense fallback={<LoadingSpinner label="Loading judging console..." />}>
                <Judging />
              </Suspense>
            } 
          />
          <Route 
            path="/results" 
            element={
              <Suspense fallback={<LoadingSpinner label="Loading leaderboard..." />}>
                <Results />
              </Suspense>
            } 
          />
          <Route 
            path="/vendors" 
            element={
              <Suspense fallback={<LoadingSpinner label="Loading vendors..." />}>
                <Vendors />
              </Suspense>
            } 
          />
          <Route 
            path="/mementos" 
            element={
              <Suspense fallback={<LoadingSpinner label="Loading mementos..." />}>
                <Mementos />
              </Suspense>
            } 
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
