import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Auth Pages
import LoginScreen from './pages/auth/Login';
import RegisterScreen from './pages/auth/Register';
import ForgotPasswordScreen from './pages/auth/ForgotPassword';

// User Layout & Pages
import UserLayout from './layouts/UserLayout';
import Beranda from './pages/main/Beranda';
import Gejala from './pages/main/Gejala';
import Edukasi from './pages/main/Edukasi';
import Profil from './pages/main/Profil';

// Admin Layout & Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminKepatuhan from './pages/admin/AdminKepatuhan';
import AdminEdukasi from './pages/admin/AdminEdukasi';
import AdminDataPasien from './pages/admin/AdminDataPasien';

export default function App() {
  return (
    <BrowserRouter basename="/Bilova-web">
      <AuthProvider>
        <Routes>
          {/* Auth Routes — tampilan mobile-first */}
          <Route path="/login" element={<AuthShell><LoginScreen /></AuthShell>} />
          <Route path="/register" element={<AuthShell><RegisterScreen /></AuthShell>} />
          <Route path="/forgot-password" element={<AuthShell><ForgotPasswordScreen /></AuthShell>} />

          {/* User Routes (Pasien) — protected */}
          <Route path="/" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
            <Route index element={<Beranda />} />
            <Route path="gejala" element={<Gejala />} />
            <Route path="edukasi" element={<Edukasi />} />
            <Route path="profil" element={<Profil />} />
          </Route>

          {/* Admin Routes — protected + admin only */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="kepatuhan" element={<AdminKepatuhan />} />
            <Route path="edukasi" element={<AdminEdukasi />} />
            <Route path="data-pasien" element={<AdminDataPasien />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Shell untuk halaman auth — tampilan mobile-centered
function AuthShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center font-['Manrope'] overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full" />
      </div>
      <div className="w-full max-w-md bg-[#F7F9FA] min-h-screen relative overflow-hidden md:rounded-[3rem] md:h-[90vh] md:min-h-[800px] md:shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/10 flex flex-col">
        <div className="h-full overflow-y-auto hide-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}