import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, ClipboardCheck, BookOpen,
  LogOut, Menu, X, ChevronRight, Activity
} from 'lucide-react';

const sidebarLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/data-pasien', icon: Users, label: 'Data Pasien' },
  { to: '/admin/kepatuhan', icon: ClipboardCheck, label: 'Kepatuhan & Monitoring' },
  { to: '/admin/edukasi', icon: BookOpen, label: 'Edukasi' },
];

const AdminLayout = () => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
        await signOut();
        navigate('/login', { replace: true });
        // Fallback: paksa reload ke halaman login jika router tidak merespon instan
        setTimeout(() => {
            if (window.location.pathname.includes('/admin')) {
               window.location.href = '/Bilova-web/login';
            }
        }, 500);
    } catch (err) {
        window.location.href = '/Bilova-web/login';
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] font-['Manrope']">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen w-72 bg-emerald-50/80 backdrop-blur-xl flex flex-col py-8 z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="px-8 mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Activity size={22} className="text-emerald-700" />
              <h1 className="text-lg font-black text-emerald-900 uppercase tracking-widest">BILOVA</h1>
            </div>
            <p className="text-[10px] text-emerald-800/60 font-bold uppercase tracking-wider mt-1">Clinical Admin</p>
          </div>
          <button className="md:hidden p-1" onClick={() => setSidebarOpen(false)}>
            <X size={20} className="text-emerald-700" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-emerald-900 font-bold shadow-sm border-r-4 border-emerald-600'
                    : 'text-emerald-700/70 hover:bg-emerald-100/50'
                }`
              }
            >
              <link.icon size={20} />
              <span className="text-sm">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-6 mt-auto pt-6 border-t border-emerald-100/50 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-sm">
              {profile?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-emerald-900 truncate">{profile?.full_name || 'Admin'}</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all font-medium text-sm"
          >
            <LogOut size={18} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-72 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#f7f9fb]/80 backdrop-blur-xl border-b border-emerald-100/30 px-6 md:px-10 py-4 flex items-center justify-between">
          <button className="md:hidden p-2 rounded-xl hover:bg-emerald-50 transition" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} className="text-emerald-800" />
          </button>
          <div className="hidden md:flex items-center gap-2">
            <h2 className="text-xl font-bold text-emerald-900 tracking-tight">Clinical Serenity</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-emerald-50 rounded-xl px-4 py-2 gap-2">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input className="bg-transparent border-none outline-none text-sm text-emerald-800 placeholder:text-emerald-400 w-48" placeholder="Cari data..." />
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-xs">
              {profile?.full_name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
