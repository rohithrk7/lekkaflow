import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Lazy load pages for performance
const Login = lazy(() => import('./pages/Login'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Bill = lazy(() => import('./pages/Bill'));
const Products = lazy(() => import('./pages/Products'));
const Analytics = lazy(() => import('./pages/Analytics'));
const ActivityHistory = lazy(() => import('./pages/ActivityHistory'));
const Profile = lazy(() => import('./pages/Profile'));

const PrivateRoute = ({ children, requireProfile = true }) => {
  const { user, profile, loading } = useAuth();
  
  if (loading) return <div className="h-screen flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>;

  if (!user) return <Navigate to="/login" />;
  
  if (requireProfile && !profile) return <Navigate to="/onboarding" />;
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<div className="h-screen flex items-center justify-center">
          <div className="w-12 h-12 skeleton rounded-xl"></div>
        </div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={
              <PrivateRoute requireProfile={false}>
                <Onboarding />
              </PrivateRoute>
            } />
            <Route path="/" element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }>
              <Route index element={<Bill />} />
              <Route path="products" element={<Products />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="history" element={<ActivityHistory />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
