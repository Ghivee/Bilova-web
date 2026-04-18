import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BiLovaLogoImg } from './UIComponents';

const LoadingScreen = () => (
  <div className="h-dvh flex items-center justify-center bg-[#FCF7FF]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 bg-[#8B2C8C] rounded-3xl flex items-center justify-center"
        style={{ boxShadow: '0 8px 32px rgba(139,44,140,0.35)' }}>
        <BiLovaLogoImg size={36} className="brightness-0 invert" />
      </div>
      <div className="w-8 h-8 rounded-full animate-spin"
        style={{ border: '4px solid #EDD9F5', borderTopColor: '#8B2C8C' }} />
      <p className="text-[#8B2C8C] font-bold text-sm">Memuat BiLova...</p>
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
