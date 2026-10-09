import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Judges from './pages/Judges';
import Participants from './pages/Participants';
import Judging from './pages/Judging';
import Results from './pages/Results';
import Vendors from './pages/Vendors';
import Mementos from './pages/Mementos';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Dashboard Routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/judges" element={<Judges />} />
            <Route path="/participants" element={<Participants />} />
            <Route path="/judging" element={<Judging />} />
            <Route path="/results" element={<Results />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/mementos" element={<Mementos />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
