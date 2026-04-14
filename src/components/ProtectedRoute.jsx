import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoSrc from '../assets/Bilova_Logo.png';

const LoadingScreen = () => (
  <div className="h-dvh flex items-center justify-center bg-[#FCF7FF]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 bg-[#8B2C8C] rounded-3xl shadow-bilova flex items-center justify-center">
        <img src={logoSrc} alt="BiLova" className="w-10 h-10 object-contain brightness-0 invert" />
      </div>
      <div className="w-8 h-8 border-4 border-[#EDD9F5] border-t-[#8B2C8C] rounded-full animate-spin" />
      <p className="text-[#8B2C8C] font-bold text-sm">Memuat BiLova...</p>
    </div>
  </div>
);

/* Protects user routes */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

/* Protects admin routes */
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};
