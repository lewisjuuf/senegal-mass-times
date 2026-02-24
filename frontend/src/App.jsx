import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('./pages/public/HomePage'));
const SearchPage = React.lazy(() => import('./pages/public/SearchPage'));
const ParishDetailPage = React.lazy(() => import('./pages/public/ParishDetailPage'));
const LoginPage = React.lazy(() => import('./pages/admin/LoginPage'));
const DashboardPage = React.lazy(() => import('./pages/admin/DashboardPage'));
const MassTimesPage = React.lazy(() => import('./pages/admin/MassTimesPage'));
const NewsPage = React.lazy(() => import('./pages/admin/NewsPage'));
const ParishInfoPage = React.lazy(() => import('./pages/admin/ParishInfoPage'));
const MasterDashboardPage = React.lazy(() => import('./pages/admin/MasterDashboardPage'));
const RegistrationPage = React.lazy(() => import('./pages/admin/RegistrationPage'));
const ChangePasswordPage = React.lazy(() => import('./pages/admin/ChangePasswordPage'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">Chargement...</p>
    </div>
  </div>
);

function App() {
  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/parish/:id" element={<ParishDetailPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/register" element={<RegistrationPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mass-times"
          element={
            <ProtectedRoute>
              <MassTimesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/news"
          element={
            <ProtectedRoute>
              <NewsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/parish-info"
          element={
            <ProtectedRoute>
              <ParishInfoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/master-dashboard"
          element={
            <ProtectedRoute>
              <MasterDashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </React.Suspense>
  );
}

export default App;
