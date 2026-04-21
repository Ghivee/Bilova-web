import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoSrc from '../assets/Nutrisea_Logo.PNG';

// NutriSea loading screen
const LoadingScreen = () => (
  <div className="h-dvh flex items-center justify-center bg-sky-50">
    <div className="flex flex-col items-center gap-4">
      <img src={logoSrc} alt="NutriSea" className="w-20 h-auto object-contain animate-pulse" />

      <div className="w-8 h-8 rounded-full animate-spin"
        style={{ border: '4px solid #e0f2fe', borderTopColor: '#0284c7' }} />
      <p className="text-sky-600 font-bold text-sm">Memuat NutriSea...</p>
    </div>
  </div>
);

/* Protects user routes — must be logged in */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

/* Protects admin routes — must be admin */
export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}
