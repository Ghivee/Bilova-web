import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Auth Pages (handle their own layout now)
import LoginScreen from './pages/auth/Login';
import RegisterScreen from './pages/auth/Register';
import ForgotPasswordScreen from './pages/auth/ForgotPassword';

// User Layout & Pages
import UserLayout from './layouts/UserLayout';
import Beranda from './pages/main/Beranda';
import TumbuhKembang from './pages/main/TumbuhKembang';
import Edukasi from './pages/main/Edukasi';
import Profil from './pages/main/Profil';
import NutriBot from './pages/main/NutriBot';

// Admin Layout & Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminKepatuhan from './pages/admin/AdminKepatuhan';
import AdminEdukasi from './pages/admin/AdminEdukasi';
import AdminDataBalita from './pages/admin/AdminDataBalita';

export default function App() {
  // import.meta.env.BASE_URL = '/' in dev, '/NutriSea-web/' in prod build
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '');
  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <Routes>
          {/* Auth — each page handles its own full-screen layout */}
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />

          {/* User */}
          <Route path="/" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
            <Route index element={<Beranda />} />
            <Route path="tumbuh-kembang" element={<TumbuhKembang />} />
            <Route path="edukasi" element={<Edukasi />} />
            <Route path="nutri-bot" element={<NutriBot />} />
            <Route path="profil" element={<Profil />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="kepatuhan" element={<AdminKepatuhan />} />
            <Route path="edukasi" element={<AdminEdukasi />} />
            <Route path="data-balita" element={<AdminDataBalita />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}