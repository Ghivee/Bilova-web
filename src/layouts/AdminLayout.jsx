import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, MapPin, BookOpen,
  LogOut, Menu, X, ArrowLeftCircle
} from 'lucide-react';
import { Modal, Button } from '../components/UIComponents';

import logoSrc from '../assets/Nutrisea_Logo.PNG';

// NutriSea Logo integration
const NutriSeaLogo = ({ className = '' }) => (
  <img 
    src={logoSrc} 
    alt="NutriSea" 
    className={`h-10 w-auto object-contain ${className}`} 
  />
);


const sidebarLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/data-balita', icon: Users, label: 'Database Real-Time' },
  { to: '/admin/kepatuhan', icon: MapPin, label: 'Heatmap Kepatuhan' },
  { to: '/admin/edukasi', icon: BookOpen, label: 'Edukasi & Artikel' },
];

const AdminLayout = () => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch {
      window.location.href = '/NutriSea-web/login';
    }
  };

  const initials = profile?.full_name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'AD';

  const Sidebar = () => (
    <aside className={`fixed top-0 left-0 h-dvh w-72 bg-white border-r border-sky-100 flex flex-col z-50 transition-transform duration-300 shadow-nutrisea
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:shadow-none`}>
      {/* Brand */}
      <div className="px-5 py-5 border-b border-sky-100 flex items-center justify-between">
        <NutriSeaLogo />
        <button className="lg:hidden p-1 text-slate-400" onClick={() => setSidebarOpen(false)}>
          <X size={20} />
        </button>
      </div>

      <div className="px-3 pt-2 pb-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Kader Posyandu</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto hide-scrollbar">
        {sidebarLinks.map(link => (
          <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                isActive ? 'bg-sky-600 text-white shadow-nutrisea-sm' : 'text-slate-600 hover:bg-sky-50'
              }`
            }>
            <link.icon size={16} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User profile + Switch & logout (pinned to bottom) */}
      <div className="px-3 pb-5 border-t border-sky-100 pt-3 space-y-2">
        <button onClick={() => { setSidebarOpen(false); navigate('/'); }}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-bold text-sm shadow-nutrisea-sm hover:opacity-90 transition">
          <div className="flex items-center gap-2"><ArrowLeftCircle size={16} /> Panel Ibu</div>
        </button>

        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-black text-xs">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-slate-900 truncate">{profile?.full_name || 'Kader'}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Posyandu</p>
          </div>
        </div>
        <button onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-red-600 hover:bg-red-50 transition font-bold text-sm">
          <LogOut size={15} /> Keluar
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-sky-50">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <Sidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-72 overflow-hidden">
        {/* Top bar (mobile only) */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-sky-100 px-5 py-3 flex items-center justify-between lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-sky-50 transition">
            <Menu size={20} className="text-sky-600" />
          </button>
          <NutriSeaLogo />
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs">
            {initials}
          </div>
        </header>

        {/* Page content — scrollable */}
        <main className="flex-1 overflow-y-auto scroll-area px-5 md:px-8 py-6">
          <Outlet />
        </main>
      </div>

      {/* Logout confirmation modal */}
      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Konfirmasi Keluar"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>Batal</Button>
            <Button variant="danger" onClick={handleConfirmLogout}>Ya, Keluar</Button>
          </>
        }
      >
        Apakah Anda yakin ingin <strong>keluar</strong> dari panel admin NutriSea?
      </Modal>
    </div>
  );
};

export default AdminLayout;
